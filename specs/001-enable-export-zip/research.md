# Research: Export Bundle Activation

## Export readiness detection
- **Decision**: Derive export enablement from the session’s cue completion stats surfaced by `useAnnotationSession` (all cues must have `importance` defined).
- **Rationale**: Hook already tracks rated vs unrated cues; leveraging the computed statistics avoids redundant state and honours existing persistence.
- **Alternatives considered**: (a) Track completion state locally in component state (risk of desync with session storage); (b) Require explicit “mark complete” action (adds friction for annotators).

## Packaging approach for JSON + VTT
- **Decision**: Reuse `exportAnnotations` in `src/utils/annotationExport.ts`, extending it to honour empty metadata and ensure deterministic filenames.
- **Rationale**: Utility already builds annotations from cues and returns ZIP blob; incremental adjustments keeps scope tight.
- **Alternatives considered**: (a) Introduce JSZip dependency for fully compliant archives (heavier footprint, not needed for MVP); (b) Offer separate JSON/VTT downloads (violates requirement for single bundle).

## Accessible export control behaviour
- **Decision**: Extend the shared `Button` component to express disabled/ready states via `aria-disabled`, focus styling, and toast confirmation on success.
- **Rationale**: Aligns with Inclusive Accessibility principle and keeps interaction consistent with other UI controls.
- **Alternatives considered**: (a) Hide the button until ready (hurts discoverability); (b) rely solely on tooltip messaging (fails keyboard/screen-reader requirements).
