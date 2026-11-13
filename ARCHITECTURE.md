# Architecture implémentée

Le runtime suit le graphe `Scope → Plan → Tool selection → Tools → Generator → Critic → Finalise`.
Les nœuds LLM utilisent exclusivement le provider OpenAI-compatible configuré par `OPENAI_*`. Le juge Groq est isolé dans `evals/run.py`.

Le retriever charge le JSONL fourni, calcule et normalise les embeddings en mémoire au démarrage, puis utilise le produit scalaire comme similarité cosinus. Son seuil par défaut est `0.39726812`. Une recherche de suivi du Critic conserve le filtre des médicaments et élargit graduellement jusqu’à `-1`; son statut est transmis au Critic afin d’éviter de re-demander une information absente du corpus.

Les deux outils locaux sont sélectionnés par tool calling : `search_medication_corpus` et `search_glossary`. La réponse finale est citée avec ses noms de fichiers et porte systématiquement l’avertissement médical.
