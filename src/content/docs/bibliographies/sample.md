---
title: Sample Work Product
description: A clearly labeled example of the intended bibliography output.
---

import BibliographyShowcase from '../../../components/BibliographyShowcase.astro';

# Sample Work Product

> **Fixture data:** This page demonstrates the presentation format. It is not the result of analyzing a real YouTube video.

<BibliographyShowcase references={[
  { timestamp: '00:42', subject: 'A sample historical reference', quote: 'A quoted phrase from the fixture.', confidence: 0.84, sourceUrl: 'https://www.loc.gov/', sourceVerification: 'unverified', context: 'The speaker gestures toward a historical source.', significance: 'This fixture demonstrates a concise significance synopsis while keeping source authenticity explicitly unverified.', disclaimer: 'Fixture data only.' },
  { timestamp: '02:18', subject: 'A deliberately uncertain candidate', quote: 'A second quoted phrase from the fixture.', confidence: 0.51, sourceUrl: 'https://www.loc.gov/', sourceVerification: 'unverified', context: 'The wording may be an indirect reference.', significance: 'Low-confidence candidates remain visible so a fleeting reference is not silently discarded.', disclaimer: 'Needs independent verification.' }
]} />

## Timeline

```d2 pad=40 direction=right
"00:42": {
  label: "00:42\nSample historical reference"
}
"02:18": {
  label: "02:18\nUncertain candidate"
}
"00:42" -> "02:18"
```

## Processing notes

- Transcript source: fixture data
- Source verification: demonstrative only
- Thumbnail policy: case-by-case, with reconstruction labels where needed
