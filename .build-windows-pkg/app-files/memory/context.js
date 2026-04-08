function buildContext({ recent, relevant }) {
  let context = "";

  if (recent.length) {
    context += "RECENT TASKS:\n";
    recent.forEach(r => {
      context += `- ${r.task}\n`;
    });
  }

  if (relevant.length) {
    context += "\nRELATED TASKS:\n";
    relevant.forEach(r => {
      context += `- ${r.task}\n`;
    });
  }

  return context;
}

module.exports = buildContext;