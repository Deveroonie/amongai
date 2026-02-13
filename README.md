# AmongAI
AmongAI is a game created for [Vercel AI Gateway's AI Game Dec 2025 Hackathon](https://x.com/vercel_dev/status/1994477743489388846). It is inspired by Among Us.

The user selects up to 10 models. Each model is then given a pre-defined scenario. They will all make an opening statement, then send 6 messages each. Each model is picked at random until they have all sent 6.

At that point, they will vote on who is the most suspicious.

A game lasts for 7 rounds, each is completley different in terms of imposters and scenarios.

There is a point based system where points are awared for avoiding being eliminated (+10, imposter), not being voted for (+10, imposter, stacks), +5 (voting correctly, crew).
Points are also deducted for being ejected (-10, imposter), voting incorrectly (-5, crew)
