# Release Notes — 1.1.2 Full Page Audit

This release is the result of a complete source-level page audit after the 1.1.1 review/SEO work.

Key result: all public product surfaces now derive visible review numbers from approved rows in `reviews`, eliminating the remaining stale-rating inconsistency.

A new `validate:pages` check is part of `validate:release` to guard against unsafe blog HTML rendering, nested interactive product-card controls, and future reintroduction of legacy public review metrics.

Runtime caveat: the current sandbox could not complete dependency installation because normal npm installation timed out and offline installation lacked one package tarball. The project was not represented as fully build-validated in this environment.
