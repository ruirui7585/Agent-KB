# Minimal Workflow Validation

## Scope

Compare the pre-existing fixed `PM → PRD → Prototype → Review` route with the explicitly invoked `run-product-workflow` router on the same Sandbox-only 1v1 gift wish-list requirement.

No formal project, existing Skill, Agent Manager source file, or previous Sandbox test was modified.

## Baseline

The pre-existing route:

- always runs the four configured product stages;
- preserves unknown behavior as open questions or `TBD`;
- does not classify task size before choosing the route;
- does not expose a workflow-level agreement gate;
- does not split the feature into vertical tickets;
- combines review concerns into one artifact.

This remains available and unchanged.

## Minimum Workflow Result

The new router classified the test as `L` because it contains two roles, multiple states, several artifacts, and independently testable outcomes.

Selected route:

```text
discover → align → spec → tickets → execute by ticket → review
```

It produced four vertical tickets:

1. recipient manages wish-list items;
2. sender views the list in a 1v1 context;
3. sender initiates a selected gift;
4. four-axis evidence review.

The state passed deterministic validation and contains no dependency cycle.

## Forward-Test Finding and Repair

The first independent forward test classified money, permission, privacy, and downstream-state decisions as blocking the Sandbox prototype. That interpretation was too broad and would cause unnecessary questions.

The Skill was revised so gate classification is relative to the current authorized deliverable:

- a test-only prototype may keep production rules `TBD`, omit their behavior, and stop at send initiation;
- production implementation must reclassify and resolve rules it will encode or rely on.

The second independent test correctly returned:

- gate `clear` for the Sandbox-only draft;
- all listed unknowns `draft-safe` for this route;
- permission to continue to a non-production prototype without inventing payment, privacy, notification, migration, or post-send behavior.

## Token Impact

The always-loaded UI metadata is short and implicit invocation is disabled for the minimum version.

The core `SKILL.md` is about 800 words. Detailed workflow state and provenance references are loaded only for `M/L/XL` work or audits. Small tasks use the direct `discover → execute → review` route and do not load ticket or provenance details.

This validation confirms the structure is designed to limit context, but it does not measure end-to-end model token usage. A real execution comparison is still required before claiming token savings.

## Outcome

Result: **Pass for minimum routing validation**

Confirmed:

- existing Skills remain unchanged;
- fixed Agent Manager workflow remains unchanged;
- small and large routes are distinguishable;
- draft-safe unknowns do not automatically block a prototype;
- vertical tickets and blocking edges are machine-checkable;
- review requires independent evidence statuses;
- a real ambiguity was found and corrected through forward testing.

Not yet confirmed:

- end-to-end PRD and prototype quality;
- actual token savings versus the baseline;
- browser interaction quality;
- behavior on a second product domain;
- current-session automatic discoverability of the newly configured Skill.

## Recommendation

Keep the new router explicitly invoked and use it on one real, non-production product task. Do not make it the default until end-to-end token use, correction count, and evidence quality outperform the baseline.
