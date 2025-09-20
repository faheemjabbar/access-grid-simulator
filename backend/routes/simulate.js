const express = require('express');
const router = express.Router();
const Simulation = require('../models/Simulation');
const CooldownState = require('../models/CoolDown');

// static room rules
const ROOMS = {
  ServerRoom: { minAccess: 2, open: '09:00', close: '11:00', cooldown: 15 },
  Vault: { minAccess: 3, open: '09:00', close: '10:00', cooldown: 30 },
  "R&D Lab": { minAccess: 1, open: '08:00', close: '12:00', cooldown: 10 }
};

function timeToMinutes(t) {
  const [hh, mm] = t.split(':').map(Number);
  return hh * 60 + mm;
}

router.post('/', async (req, res) => {
  try {
    const employees = Array.isArray(req.body.employees) ? req.body.employees : [];
    const normalized = employees.map((e, idx) => ({
      _inputIndex: idx,
      id: e.id,
      access_level: Number(e.access_level),
      request_time: e.request_time,
      room: e.room
    }));

    // sort chronologically
    normalized.sort((a, b) => {
      const ta = timeToMinutes(a.request_time);
      const tb = timeToMinutes(b.request_time);
      if (ta !== tb) return ta - tb;
      return a._inputIndex - b._inputIndex;
    });

    // load saved cooldown states from DB
    const savedStates = await CooldownState.find({});
    const lastGranted = {};
    savedStates.forEach(s => { lastGranted[s.key] = s.lastTime; });

    const results = normalized.map(item => {
      const { id, access_level, request_time, room } = item;
      const roomRule = ROOMS[room];
      const reqMin = timeToMinutes(request_time);

      if (!roomRule) {
        return { id, request_time, room, granted: false, reason: `Denied: Unknown room "${room}"` };
      }

      if (access_level < roomRule.minAccess) {
        return { id, request_time, room, granted: false, reason: `Denied: Below required level (required ${roomRule.minAccess}, has ${access_level})` };
      }

      const openMin = timeToMinutes(roomRule.open);
      const closeMin = timeToMinutes(roomRule.close);
      if (reqMin < openMin || reqMin > closeMin) {
        return { id, request_time, room, granted: false, reason: `Denied: Room closed (open ${roomRule.open} - ${roomRule.close})` };
      }

      const key = `${id}||${room}`;
      const last = lastGranted[key];
      if (last !== undefined) {
        const diff = reqMin - last;
        if (diff < roomRule.cooldown) {
          return {
            id, request_time, room, granted: false,
            reason: `Denied: Cooldown active (last granted at ${String(Math.floor(last/60)).padStart(2,'0')}:${String(last%60).padStart(2,'0')}, wait ${roomRule.cooldown - diff} more minutes)`
          };
        }
      }

      // granted
      lastGranted[key] = reqMin;
      return { id, request_time, room, granted: true, reason: `Access granted to ${room}` };
    });

    // save simulation log
    try {
      await Simulation.create({ input: employees, result: results });
    } catch (e) {
      console.warn('Failed to save simulation:', e.message);
    }

    // update cooldown DB
    const ops = Object.entries(lastGranted).map(([key, lastTime]) => ({
      updateOne: {
        filter: { key },
        update: { lastTime },
        upsert: true
      }
    }));
    if (ops.length > 0) await CooldownState.bulkWrite(ops);

    res.json({ success: true, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});
router.delete('/reset-cooldowns', async (req, res) => {
  try {
    await CooldownState.deleteMany({});
    res.json({ message: 'Cooldown states reset' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
