---
name: accessible-digital-formats
description: Produce and quality-check accessible EPUB 3 ebooks and digital audio deliverables that meet retailer specs and the European Accessibility Act. Use when converting books to ebook, choosing conversion vendors, or checking accessibility compliance.
metadata:
  roster-id: S18
  used-by:
  - audio-publishing-producer
  - digital-publishing-metadata-specialist
  - publishing-technology-architect
---

# Accessible digital formats

*Roster skill S18. Preloaded into: `audio-publishing-producer`, `digital-publishing-metadata-specialist`, `publishing-technology-architect`.*

## Purpose
Ebooks and audio are high-margin formats. Accessibility is now a legal requirement in the EU (EAA, June 2025) and good practice everywhere.

## Standards
- **EPUB 3** with semantic structure (headings, lists, tables), a logical reading order, a navigation document (TOC) and page list, language tags, and **alt text** for meaningful images.
- **Accessibility metadata** (schema.org: accessMode, accessibilityFeature, accessibilityHazard, accessibilitySummary) and conformance to EPUB Accessibility 1.1 / WCAG 2.x AA.
- Validate with **EPUBCheck** and **Ace by DAISY**.
- Retailer specs: Amazon (EPUB accepted), Apple, Kobo, Google, and OverDrive for libraries.
- Audio deliverables: ACX/retailer specs (e.g. RMS −23 to −18 dB, peak ≤ −3 dB, noise floor ≤ −60 dB, 44.1kHz MP3 192kbps CBR), opening and closing credits, and a retail sample.

## Method
1. Choose a workflow: in-house (InDesign → EPUB, Vellum for simple text) or a conversion vendor with accessibility guarantees.
2. Write image alt text during editorial, not at the end.
3. Validate, fix, and re-validate. Test on 2+ reading systems, including a screen reader.
4. Record the conformance status in metadata.

## Pitfalls
- Fixed-layout ebooks (cookbooks, picture books) are much harder to make accessible. Plan for this.
- PDF-to-EPUB conversions without QA.
