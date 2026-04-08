const base = ({ role, task, instructions, constraints, model, purpose }) => `
You are ${role}.
Target Model: ${model}
Target Purpose: ${purpose}

TASK:
${task}

INSTRUCTIONS:
${instructions}

CONSTRAINTS:
${constraints?.length ? constraints.map(c => `- ${c}`).join("\n") : "- None"}

OUTPUT FORMAT:
- Clean, production-ready code
- Include comments where necessary
- Minimal explanation unless requested
- Optimized for ${model} usage
`;

const templates = {
  coding: ({ language, task, context, constraints, level, model, purpose }) =>
    base({
      role: `a senior ${language} developer building for ${purpose}`,
      task,
      instructions: `
- Write high-quality ${language} code
- Follow best practices (${level})
- Handle edge cases
- Optimize performance and readability
- Target purpose: ${purpose}
${context ? `\nCONTEXT:\n${context}` : ""}
      `,
      constraints,
      model,
      purpose
    }),

  debugging: ({ language, task, context, constraints, model, purpose }) =>
    base({
      role: `an expert ${language} debugger`,
      task: `Fix this code for ${purpose}:\n${task}`,
      instructions: `
- Identify root cause
- Fix the issue
- Improve code quality
- Ensure ${model} compatibility
${context ? `\nCONTEXT:\n${context}` : ""}
      `,
      constraints,
      model,
      purpose
    }),

  refactor: ({ language, task, context, constraints, model, purpose }) =>
    base({
      role: `a senior software engineer`,
      task: `Refactor this ${language} code for ${purpose}:\n${task}`,
      instructions: `
- Improve readability
- Apply clean code principles
- Optimize performance
- Consider ${purpose} requirements
${context ? `\nCONTEXT:\n${context}` : ""}
      `,
      constraints,
      model,
      purpose
    }),

  testing: ({ language, task, context, constraints, level, model, purpose }) =>
    base({
      role: `a ${level} ${language} testing specialist`,
      task: `Write tests for this ${purpose}:\n${task}`,
      instructions: `
- Write comprehensive test cases (${level})
- Cover edge cases and error scenarios
- Use best practices for ${language} testing
- Make tests clear and maintainable
- Suitable for ${purpose} deployment
${context ? `\nCONTEXT:\n${context}` : ""}
      `,
      constraints,
      model,
      purpose
    }),

  documentation: ({ language, task, context, constraints, model, purpose }) =>
    base({
      role: `a technical writer`,
      task: `Write documentation for this ${purpose}:\n${task}`,
      instructions: `
- Create clear, concise documentation
- Include code examples where relevant
- Document parameters, return values, and exceptions
- Write for ${language} developers
- Use markdown format
- Explain ${purpose} context
${context ? `\nCONTEXT:\n${context}` : ""}
      `,
      constraints,
      model,
      purpose
    }),

  architecture: ({ language, task, context, constraints, model, purpose }) =>
    base({
      role: `a software architect`,
      task: `Design the architecture for ${purpose}:\n${task}`,
      instructions: `
- Design scalable, maintainable architecture
- Consider performance and security
- Use appropriate ${language} patterns
- Provide component diagrams or descriptions
- Include implementation recommendations
- Optimize for ${purpose}
${context ? `\nCONTEXT:\n${context}` : ""}
      `,
      constraints,
      model,
      purpose
    }),

  "code-review": ({ language, task, context, constraints, model, purpose }) =>
    base({
      role: `an experienced ${language} code reviewer`,
      task: `Review this code for ${purpose}:\n${task}`,
      instructions: `
- Identify issues and improvements
- Check for bugs, security issues, and best practices
- Provide constructive feedback
- Suggest specific improvements
- Rate overall code quality
- Consider ${purpose} deployment requirements
${context ? `\nCONTEXT:\n${context}` : ""}
      `,
      constraints,
      model,
      purpose
    }),

  optimization: ({ language, task, context, constraints, model, purpose }) =>
    base({
      role: `a ${language} performance optimization expert`,
      task: `Optimize this code for ${purpose}:\n${task}`,
      instructions: `
- Identify performance bottlenecks
- Suggest optimization strategies
- Provide optimized code with explanations
- Consider memory usage and time complexity
- Include before/after performance comparisons
- Optimize for ${purpose} use case
${context ? `\nCONTEXT:\n${context}` : ""}
      `,
      constraints,
      model,
      purpose
    }),

  // Database & SQL Templates
  "database-query": ({ language, task, context, constraints, model, purpose }) =>
    base({
      role: `a ${language} database specialist`,
      task: `Write an optimized database query:\n${task}`,
      instructions: `
- Write efficient ${language} database code
- Include proper indexing considerations
- Use parameterized queries for security
- Add comments explaining the logic
- Consider performance and scalability
- Include error handling
${context ? `\nCONTEXT:\n${context}` : ""}
      `,
      constraints,
      model,
      purpose
    }),

  "database-schema": ({ language, task, context, constraints, model, purpose }) =>
    base({
      role: `a database architect`,
      task: `Design a database schema for ${purpose}:\n${task}`,
      instructions: `
- Design normalized ${language} database schema
- Include tables, columns, relationships
- Add primary and foreign keys
- Include indexes for common queries
- Provide migration scripts
- Document relationships and constraints
${context ? `\nCONTEXT:\n${context}` : ""}
      `,
      constraints,
      model,
      purpose
    }),

  // Telephony & VoIP Templates
  "telephony-dialplan": ({ language, task, context, constraints, model, purpose }) =>
    base({
      role: `an Asterisk/VoIP configuration expert`,
      task: `Create a ${language} dialplan for ${purpose}:\n${task}`,
      instructions: `
- Write ${language === 'Asterisk' ? 'Asterisk dialplan' : language} configuration
- Include call routing logic
- Add error handling and fallback options
- Include comments explaining each step
- Ensure compatibility with standard SIP
- Add security considerations (auth, rate limiting)
${context ? `\nCONTEXT:\n${context}` : ""}
      `,
      constraints,
      model,
      purpose
    }),

  "telephony-config": ({ language, task, context, constraints, model, purpose }) =>
    base({
      role: `a VoIP systems engineer`,
      task: `Configure telephony system for ${purpose}:\n${task}`,
      instructions: `
- Create ${language} telephony configuration
- Setup SIP endpoints and gateways
- Configure voice quality settings
- Include security policies
- Add failover and redundancy
- Document all settings
${context ? `\nCONTEXT:\n${context}` : ""}
      `,
      constraints,
      model,
      purpose
    }),

  "telephony-script": ({ language, task, context, constraints, model, purpose }) =>
    base({
      role: `a IVR (Interactive Voice Response) developer`,
      task: `Create IVR script in ${language} for ${purpose}:\n${task}`,
      instructions: `
- Write ${language} IVR script
- Include prompts and menu options
- Add caller routing logic
- Include error handling
- Consider accessibility
- Add recording and logging
${context ? `\nCONTEXT:\n${context}` : ""}
      `,
      constraints,
      model,
      purpose
    })
};

module.exports = templates;
