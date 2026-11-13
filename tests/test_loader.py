from app.retrieval.loader import load_chunks


def test_supplied_chunks_are_loaded_without_rechunking():
    chunks = load_chunks(__import__("pathlib").Path("chunks.jsonl"))

    assert len(chunks) > 100
    assert chunks[0].chunk_id == "dailymed-acetaminophen_chunk_001"
    assert chunks[0].source_file == "dailymed-acetaminophen.md"
    assert "Current section" in chunks[0].text
