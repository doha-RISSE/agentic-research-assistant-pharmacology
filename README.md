# Agent de recherche pharmacologique

Agent Python de recherche sur un corpus local, construit avec FastAPI et LangGraph. Il répond uniquement à partir des chunks fournis, affiche les fichiers sources et ajoute systématiquement un avertissement médical. Le frontend React est compilé depuis `web/` et servi par la même API FastAPI : aucune seconde application ou URL n’est nécessaire.

## Architecture

`Scope (LLM) → Plan (LLM) → sélection dynamique des outils (LLM tool calling) → retrieval → Generator (LLM) → Critic (LLM) → réponse`

- Un `StateGraph` typé assure le routage hors périmètre, qui ne consulte aucun document.
- `search_medication_corpus` exécute une similarité cosinus sur les embeddings calculés en mémoire au démarrage. Il accepte un filtre multi-médicaments fourni par le LLM.
- `search_glossary` recherche les définitions dans `corpus/GLOSSARY.md`.
- À la demande du Critic, une recherche sans résultat baisse progressivement le seuil jusqu’à `-1`, ce qui examine tous les chunks du filtre actif. La recherche reste filtrée par les médicaments de la question.
- La boucle Critic est plafonnée par `MAX_CRITIC_ITERATIONS` (2 par défaut).

Le corpus reste inchangé : le chargeur lit directement `chunks.jsonl`, il ne re-chunk pas les fichiers source.

## Lancement local

Pré-requis : Python 3.11+ et un fournisseur OpenAI-compatible accessible.

```powershell
Copy-Item .env.example .env
# renseigner les quatre variables OPENAI_* dans .env
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Ouvrir `http://localhost:8000`. Pendant le calcul initial des embeddings, `GET /health` répond immédiatement avec `{"status":"starting"}`. Quand l’index est prêt, `POST /ask` accepte `{"question":"..."}`. Une variable manquante apparaît clairement dans `/health` et les appels à `/ask` retournent `503`.

## Docker

```bash
docker build -t agent .
docker run -p 8000:8000 --env-file .env agent
```

L’image contient le code, le corpus, le glossaire et `chunks.jsonl`; `.env` est exclu de l’image. L’API runtime ne dépend jamais de Groq.

Le build Docker compile aussi l’interface React incluse dans `web/`, puis place un unique `frontend/index.html` autonome dans l’image. L’interface appelle `POST /ask` sur la même origine : les réponses, sources et disclaimers viennent exclusivement du backend.

### Modifier uniquement l’interface

Le code source du frontend est dans `web/src/`. Le build est déjà exécuté automatiquement par Docker. Pour régénérer la page statique hors Docker lorsque Node/npm est installé :

```bash
cd web
npm ci
npm run build
```

## Tests et évaluation

```bash
pytest
python evals/run.py
```

`evals/run.py` appelle l’API locale, puis utilise seulement `GROQ_API_KEY`, `GROQ_BASE_URL` et `JUDGE_MODEL` pour évaluer les sorties. Il écrit `reports/evaluation.json`. Le dataset contient les quatre scénarios publics ainsi qu’un cas d’injection/hors périmètre; les critères, dont les rubrics de trajectoire, sont versionnés dans `evals/rubric.md`.

## Variables

`OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL` et `OPENAI_EMBEDDING_MODEL` sont obligatoires. `SIMILARITY_THRESHOLD` vaut par défaut exactement `0.39726812`; `MAX_CRITIC_ITERATIONS` vaut `2`.
