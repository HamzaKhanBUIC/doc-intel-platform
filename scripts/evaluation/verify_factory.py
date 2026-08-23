import os
import sys

# Force UTF-8 on Windows stdout
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

BASE_DIR = r"g:\My Drive\AI Product Factory — Session 03 — Document Intelligence"

errors = []

# 1. Verify Control Plane files
control_files = [
    ".agent/ORCHESTRATOR.md",
    ".agent/STATE.md",
    ".agent/DECISIONS.md",
    ".agent/ASSUMPTIONS.md",
    ".agent/OPEN_PROBLEMS.md",
    ".agent/CURRENT_OBJECTIVE.md",
    ".agent/HANDOFF.md"
]
for cf in control_files:
    full = os.path.join(BASE_DIR, cf)
    if not os.path.isfile(full):
        errors.append(f"Missing control plane file: {cf}")
    elif os.path.getsize(full) < 50:
        errors.append(f"Control plane file too small / unpopulated: {cf}")

# 2. Verify all 18 agents
expected_agents = [
    "researcher", "competitor-analyst", "customer-analyst", "document-intelligence-researcher",
    "product-strategist", "workflow-analyst", "ux-researcher", "designer", "architect",
    "ingestion-engineer", "extraction-engineer", "backend-engineer", "frontend-engineer",
    "qa-engineer", "security-reviewer", "reliability-reviewer", "red-team", "final-evaluator"
]
agent_required_sections = [
    "Role & Identity", "Core Responsibilities", "Explicit Non-Responsibilities",
    "Inputs & Artifacts", "Evidence & Verification Requirements", "Permitted Tools",
    "Quality Gates & Acceptance Checks", "Stopping Criteria", "Autonomous Escalation Rules"
]

for ag in expected_agents:
    agent_path = os.path.join(BASE_DIR, f".agents/agents/{ag}/agent.md")
    if not os.path.isfile(agent_path):
        errors.append(f"Missing agent definition: {agent_path}")
        continue
    content = open(agent_path, "r", encoding="utf-8").read()
    if not content.startswith("---"):
        errors.append(f"Agent {ag} missing YAML frontmatter")
    for sec in agent_required_sections:
        if sec not in content:
            errors.append(f"Agent {ag} missing required section: {sec}")

# 3. Verify all 16 skills
expected_skills = [
    "research", "competitive-analysis", "problem-validation", "document-research",
    "extraction-design", "product-definition", "ux-design", "stitch-design",
    "implementation", "document-testing", "browser-testing", "debugging",
    "security-review", "red-team", "repair", "final-evaluation"
]
skill_required_sections = [
    "1. Purpose", "2. Trigger Conditions", "3. Inputs & Prerequisites",
    "4. Step-by-Step Procedure", "5. Output Deliverables",
    "6. Quality Checks & Verification", "7. Failure Handling & Fallback Strategy"
]

for sk in expected_skills:
    skill_path = os.path.join(BASE_DIR, f".agents/skills/{sk}/SKILL.md")
    if not os.path.isfile(skill_path):
        errors.append(f"Missing skill definition: {skill_path}")
        continue
    content = open(skill_path, "r", encoding="utf-8").read()
    if not content.startswith("---"):
        errors.append(f"Skill {sk} missing YAML frontmatter")
    for sec in skill_required_sections:
        if sec not in content:
            errors.append(f"Skill {sk} missing required section: {sec}")

# 4. Verify Architecture Specs
arch_files = [
    "architecture/ARCHITECTURE.md", "architecture/INGESTION.md", "architecture/EXTRACTION.md",
    "architecture/VALIDATION.md", "architecture/DATA_MODEL.md", "architecture/PIPELINE.md",
    "architecture/STORAGE.md", "architecture/SECURITY.md", "architecture/FAILURE_RECOVERY.md"
]
for af in arch_files:
    full = os.path.join(BASE_DIR, af)
    if not os.path.isfile(full):
        errors.append(f"Missing architecture spec: {af}")

# 5. Verify Test Plan
test_files = ["testing/TEST_PLAN.md"]
for tf in test_files:
    full = os.path.join(BASE_DIR, tf)
    if not os.path.isfile(full):
        errors.append(f"Missing test file: {tf}")

# 6. Verify Docs & Factory Setup Report
doc_files = [
    "docs/DOCUMENT_HANDLING.md", "docs/API.md", "docs/OPERATIONS.md",
    "docs/SETUP.md", "docs/README.md", "docs/FACTORY_SETUP_REPORT.md"
]
for df in doc_files:
    full = os.path.join(BASE_DIR, df)
    if not os.path.isfile(full):
        errors.append(f"Missing doc file: {df}")

# Check Factory Setup Report status
report_path = os.path.join(BASE_DIR, "docs/FACTORY_SETUP_REPORT.md")
if os.path.isfile(report_path):
    report_content = open(report_path, "r", encoding="utf-8").read()
    if "FACTORY STATUS:\nREADY" not in report_content and "FACTORY STATUS:\nBLOCKED" not in report_content:
        errors.append("docs/FACTORY_SETUP_REPORT.md does not conclude with FACTORY STATUS: READY or BLOCKED")

print("=== FACTORY INFRASTRUCTURE VERIFICATION REPORT ===")
print(f"Total Agents Checked: {len(expected_agents)}")
print(f"Total Skills Checked: {len(expected_skills)}")
print(f"Total Control Plane Files: {len(control_files)}")
print(f"Total Architecture Files: {len(arch_files)}")
print(f"Total Documentation Files: {len(doc_files)}")

if errors:
    print(f"\n[FAIL] Found {len(errors)} errors:")
    for e in errors:
        print(f"  - {e}")
    sys.exit(1)
else:
    print("\n[PASS] All 18 Agents, 16 Skills, Control Plane, Architecture, and Setup Reports verified with 100% compliance!")