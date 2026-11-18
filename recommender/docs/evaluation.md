# Evaluation notes

## Method
Hard filters (specialty present, capacity data present, >=1 bed of the needed kind),
then weighted score = w_distance*distance + w_beds*beds + w_specialist*on_duty.
Distance score = 1 - km/30 (floored at 0). Bed score = min(beds/10, 1).
Ties break by score, distance, then hospital id (deterministic).

## Weights (distance / beds / specialist)
cardiac .30/.25/.45; stroke .35/.20/.45; trauma .40/.25/.35; pregnancy .40/.20/.40;
breathing .35/.25/.40; minor .60/.25/.15.

## Fallback
Used when capacity data is stale (>6 h) or missing, nothing passes the filters, or an
exception occurs: nearest hospital with the required specialty. `used_fallback=true`.

## Assumptions / limitations
- Emergency -> ambulance/specialty mapping is a draft; needs medical review.
- Straight-line distance, not road travel time (can later use Shreya's ETA).
- Weights are hand-set, not learned. No ML: no labelled outcome data exists.
- Demo data is synthetic; real bed/specialist data will come from Archit's APIs.
- Auth is a placeholder API key pending the team's agreed method (Samarth).
