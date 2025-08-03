# Evergreen Training Framework for Home Gym

## Introduction

This program is designed for a 50‑year‑old male (5′6″ at 167 lb) returning to training after a two‑year layoff.  Health flags include elevated cholesterol and pre‑hypertension, so the plan emphasises moderate loads, controlled tempo, proper breathing (no Valsalva manoeuvre) and progressive improvement of cardiovascular markers.  The only equipment required is the **FEIERDUN 5‑in‑1 adjustable dumbbell set** (8–45 lb per dumbbell, 10–91 lb barbell, kettlebell handle and push‑up stands)【320498090732396†L293-L301】 and an adjustable bench that declines to −30° and inclines to +85°.  Each session lasts ≈30 minutes and includes mobility, warm‑ups, compound lifts, back‑friendly core work and cool‑down stretches.

### Evidence‑Based Rationale

Evidence from the National Strength & Conditioning Association shows that older adults benefit from progressive resistance training and that **gradual increases in intensity from very light (≈40 % 1RM) to vigorous (≥70 % 1RM)** improve strength while remaining safe【483509124885424†L1836-L1844】.  For untrained or obese individuals a familiarisation phase with light loads and 10–15 repetitions is recommended【483509124885424†L1822-L1832】.  Resistance training also reduces cardiometabolic risk: meta‑analyses report **reductions of 3–7 mm Hg in both systolic and diastolic blood pressure**【483509124885424†L1883-L1888】 when low‑ to moderate‑intensity loads are performed using proper breathing and full range of motion【483509124885424†L1903-L1908】.  This program follows these recommendations by starting conservatively and adjusting load according to performance.

## Baseline Week (Week 1) – Sample Schedule

During the first week every exercise is performed at an **easy RPE 6–7**, leaving 2–3 repetitions in reserve.  The goal is to establish movement patterns and collect data to estimate your working one‑rep max (1RM) for each lift.  Use the FEIERDUN dumbbells/barbell to select a weight that allows the prescribed reps with good form (for example, 15–20 lb for upper‑body lifts and 25–35 lb for lower‑body lifts).  Record *weight*, *reps* and *RPE* in the web app.

| Day | Warm‑Up & Mobility | Main Lifts & Targets | Accessory & Core | Cool‑down |
|---|---|---|---|---|
| **Monday – Lower (Squat Focus)** | 5 min brisk walk or marching in place; dynamic hip flexor and hamstring stretches; bird dog × 2 × 10 each side | **Goblet squat** – 3×8 @ RPE 6; **split squat** (rear foot elevated on bench) – 2×10 each leg | **Glute bridge** – 2×12; **bird dog** – 2×10 each side | 3–5 min stretching (hamstrings, calves, quads) |
| **Tuesday – Upper Push (Horizontal)** | Arm circles and wall slides; light dumbbell floor press 2×10 | **Dumbbell bench press** – 3×8 @ RPE 6; **incline dumbbell bench press** – 2×10 | **Push‑up stand holds** (FEIERDUN handles) – 2×max; **plank** – 2×30 s | Chest/shoulder stretches |
| **Wednesday – Pull & Core** | Thoracic spine mobilisation with foam or towel; band pull‑aparts × 2×15 | **Single‑arm row** – 3×8 each arm; **renegade row** – 2×8 each side | **Russian twist** with light plate – 2×16 (8/side); **side plank** – 2×20 s/side | Upper‑back and lat stretches |
| **Thursday – Hip Hinge & Kettlebell** | Hip hinge drill with dowel; glute activation with mini‑band | **Romanian deadlift** (dumbbell or barbell) – 3×8 @ RPE 6; **kettlebell swing** – 3×12 (light weight) | **Reverse lunge** – 2×10/leg; **bird dog** – 2×10 each side | Hamstring/hip flexor stretches |
| **Friday – Upper Push (Overhead) & Core** | Shoulder dislocates with band; scapular push‑ups × 2×10 | **Overhead press** (seated or standing) – 3×8 @ RPE 6; **floor press** – 2×10 | **Biceps curl** – 2×12; **triceps extension** – 2×12; **dead bug** – 2×10 each side | Stretch chest, shoulders and triceps |

**Notes:**

* Keep rest periods ≈60–90 s to stay within the 30‑minute window.
* Use the bench’s incline/decline settings to vary angles: −30° decline for floor or bench press assistance and +30° to +60° incline for shoulder‑focused work.
* Maintain neutral spine on all lifts, especially Romanian deadlifts and kettlebell swings; focus on hip hinge rather than spinal flexion.

## Week 2 and Beyond – Progressive Template

From Week 2 onward you’ll follow an adaptive program that automatically adjusts load and reps.  Each main lift starts at **≈65 % of your estimated 1RM**, rounded to the nearest 5 lb to match the FEIERDUN plates.  The program rotates through three weekly variations:

1. **Strength Day:** 4×6 at RPE 7–8 with slightly heavier loads.
2. **Hypertrophy Day:** 3×10 at RPE 6–7 for moderate volume.
3. **Volume Day:** 2×15 at RPE 6 with lighter loads and higher reps.

Accessory movements continue at 2–3 sets of 10–15 reps.  Core and mobility drills remain daily.  Track each set’s weight, reps and RPE in the logger.  At the end of each session the progression engine compares your performance to the target:

* **≥2 reps above target** → increase the target weight by ~5 lb per dumbbell (≈10 lb total on barbell) for the next session.
* **Below target reps** → reduce the target weight by 5 lb per dumbbell to maintain proper form and avoid overreaching.
* **On target** → keep weight unchanged but aim to improve technique or tempo.

Quarterly (every 12 weeks), set SMART goals for strength (e.g. add 30 lb to your bench press 5RM), body composition (e.g. drop waist circumference by 2 inches) and vitals (e.g. average systolic BP < 120 mm Hg).  Use the dashboard’s trend charts to assess progress.

## Adaptive Progression Algorithm (Simplified Pseudocode)

```text
for each exercise in workout:
    record weight, reps, RPE for all sets
    if baseline not established:
        estimate 1RM = weight * reps / (1 - 0.0333 * reps)
        set targetWeight = round(0.65 * estimated 1RM to nearest 5 lb)
        set targetReps = 10
    else:
        if performedReps ≥ targetReps + 2:
            targetWeight += 5
        else if performedReps < targetReps:
            targetWeight = max(5, targetWeight - 5)
        # rep cycling could be added: after multiple increases, lower reps and increase weight
    save updated progression
```

The algorithm deliberately moves in small 5‑lb increments to respect the FEIERDUN plate system and to avoid overshooting recovery.  It uses the **Epley formula** (1RM = weight × reps ÷ (1 – 0.0333 × reps)) to estimate your capability after the baseline week, then sets initial targets at 65 % of that value.  When you consistently exceed targets, the load increases; when you miss, it deloads.  More sophisticated rep‑waves or auto‑regulation can be implemented later.

## Safety & Recovery Considerations

* **Warm‑up thoroughly** and prioritise good technique.  Never sacrifice form for load.
* **Avoid the Valsalva manoeuvre**; exhale through the sticking point to minimise blood pressure spikes【483509124885424†L1903-L1909】.
* Include **two rest days (weekends)** for recovery and cardiovascular activities like brisk walking or cycling.
* Monitor **blood pressure and cholesterol** regularly.  Resistance training combined with aerobic activity has been shown to reduce systolic and diastolic BP by 3–7 mm Hg【483509124885424†L1883-L1888】.
* Stay hydrated, prioritise sleep and ensure adequate protein intake (≈1.6–2.2 g/kg bodyweight) to support muscle growth and cholesterol management.

## Using the Web App

1. **Baseline Week Wizard:** Use the Baseline tab to enter your heaviest comfortable set for each main lift.  The app calculates your estimated 1RM and seeds the progression engine.
2. **Log Workouts:** On the Workout tab, select exercises and record each set.  The app stores your session and updates your targets based on performance.
3. **Dashboard:** View weekly volume, personal records and trend charts for volume, blood pressure and bodyweight.  Use the dark/light toggle and sticky bottom navigation to switch views easily on mobile.
4. **Vitals:** Record BP, heart rate, cholesterol and bodyweight in the Vitals tab.  Charts help you correlate training load with health markers.

The entire solution is local‑first: your data lives in a SQLite database bundled with the application.  You can create an **encrypted backup** from the settings/backup route and optionally restore it on another device.  Cloud synchronisation via Supabase can be added by configuring your project’s URL and anon key in `.env` files.