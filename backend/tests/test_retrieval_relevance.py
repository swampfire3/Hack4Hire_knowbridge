from app.routers import has_distinctive_term_match


def test_lexical_fallback_keeps_exact_acronym_matches():
    assert has_distinctive_term_match("what is NCDL", "The NCDL process has three stages.")


def test_lexical_fallback_keeps_purpose_passages():
    assert has_distinctive_term_match("what is the purpose of this pdf", "The purpose of this policy is to define controls.")


def test_lexical_fallback_does_not_match_only_question_stopwords():
    assert not has_distinctive_term_match("what is this pdf", "This manual describes the organization.")
