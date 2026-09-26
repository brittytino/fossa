# reply-addressing — unmentioned replies in Fossy threads

> - **Answers:** When someone replies in a thread Fossy started without writing @fossy, does the classifier answer the replies meant for Fossy and stay out of the rest (#1946)?
> - **Runs:** on demand with a real model; every PR (`evals/wiring-smoke.js`) against the scripted model.
> - **Run it:** `pnpm eval:reply-addressing` · `node evals/reply-addressing/run.js --dataset=repo-cases --model=gemini-3-flash-preview`
> - **Gate:** none yet; exit 2 when more than 5% of calls fail. The ship bar is set on the issue from the first runs.
> - **Cost:** 70 short calls per repeat (`cases`), 373 (`repo-cases`).

`run.js` calls the production classifier, `classifyReplyAddressedToFossy` in
`libs/platform/application/use-cases/codeManagement/implicit-reply.ts`, which
is the single `LLM.run` call the conversation use case makes before answering an
unmentioned reply. The model goes through the managed slot (`applyModelEnv`),
the path an org without BYOK takes.

`cases.json` holds the 64 boundary conversations from the TypeSafe experiment
on the issue, plus threads where two people talk and one of them turns to Fossy
(`category: multi-human-to-fossy`). The code gate that runs before the
classifier (Fossy started the thread, the author is not Fossy, the bot cap) is
covered by unit tests, not here.

`repo-cases.json` holds real replies from review threads Fossy started on
brittytino/fossa (from April 2025), each with its PR link. Most were written
by people or by Claude working on their behalf, answering the finding with a
disposition ("Fixed in …", "Not applying: …"), which the issue counts as
directed at Fossy. Each thread was read and labeled by hand: a reply that
@-mentions or answers another person is `quiet`. Dropped: replies that were
Fossy's own answers posted from a team member's account before the bot had its
own identity, replies that talk about Fossy in the third person (ambiguous), and
near-duplicate texts.

The result prints precision, recall and specificity overall and on
multi-human threads alone. A false answer interrupts people talking to each
other; a miss only means the person writes @fossy, so precision is the number
to watch.
