# Claude Code Instructions

## Critical Project Requirements

### Git Commit Standards
**CRITICAL: NEVER COMMIT OR PUSH WITHOUT EXPLICIT USER PERMISSION**

⚠️ **ABSOLUTE RULE: Git Operations Require Permission**
- `git add`, `git commit`, `git push` - ALWAYS ask for explicit user permission
- NEVER perform these operations autonomously
- User must explicitly request these actions
- Claude permissions are configured to enforce this rule

**MANDATORY: All commits must follow these senior engineering standards:**

1. **Identity Requirements**
   - NEVER mention Claude, Claude Code, AI, or any AI-related terms in commits
   - Write as a senior human engineer would
   - Maintain professional, technical tone

2. **Commit Message Format**
   ```
   <type>: <subject>
   
   <body>
   
   <footer>
   ```

3. **Commit Types (Semantic)**
   - `feat:` New feature implementation
   - `fix:` Bug fixes or corrections
   - `docs:` Documentation changes only
   - `style:` Code style/formatting (no logic changes)
   - `refactor:` Code restructuring without behavior change
   - `perf:` Performance improvements
   - `test:` Test additions or corrections
   - `chore:` Maintenance tasks, dependency updates
   - `build:` Build system or configuration changes
   - `ci:` CI/CD pipeline changes

4. **Subject Line Rules**
   - Maximum 50 characters
   - Imperative mood ("add" not "added" or "adds")
   - No period at the end
   - Lowercase start

5. **Body Requirements**
   - Wrap at 72 characters
   - Explain what and why, not how
   - Include bullet points for multiple changes
   - Reference affected components

6. **Professional Standards**
   - Be concise yet detailed
   - Include technical context when relevant
   - List affected files/modules when multiple changes
   - Use present tense for current changes

### Example Commit Format
```
fix: correct project timestamps to reflect actual timeline

- Update all date references from January 2025 to August 2025
- Correct historical dates from 2024 to 2025 across documentation
- Synchronize timestamps in configuration templates

Affected components:
- Documentation timestamps (DOCUMENTATION.md, PROJECT_CONTEXT.md)
- Task Master configuration templates
- Command documentation timestamps
```

## Task Master AI Instructions
**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md
