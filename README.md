# Stone, Bone, Cone

It's just like rock, paper, scissors, but with a pre-historic theme (and also it
rhymes). This project was created for the Deno KV Hackathon and was submitted on
June 15, 2023.

The purpose of this game is to showcase the new Deno KV database by creating a
massively-multiplayer rock-paper-scissors tournament on top of it. Check it out
at stonebonecone.com!

The game requires a cron job to run the tournament, and since there is no way to
set that up with Deno Deploy, there is no logic in the repo to trigger it.
However, it can easily be set up on a non-serverless environment. The cron job
just has to hit the endpoint "/api/runTourney".
