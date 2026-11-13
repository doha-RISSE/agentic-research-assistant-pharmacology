# Pharmacology research agent

- Keep runtime secrets exclusively in environment variables. Never commit `.env`.
- The API runtime must not import or depend on Groq; only `evals/` may use it.
- `chunks.jsonl` is a supplied artifact: do not regenerate or re-chunk it.
- Answers must remain corpus-grounded, cite source filenames, and include the medical disclaimer.
