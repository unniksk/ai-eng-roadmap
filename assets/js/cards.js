// Anki-style flashcards per topic: [card id, front, back]. Card ids are stored with review history in
// localStorage, so never rename or reuse one; add new cards with the next number.
window.CARDS={
ch1:[
['ch1-1','What is the difference between a workflow and an agent?','In a workflow, code decides the sequence of model and tool calls. In an agent, the model decides the next step in a loop until it stops.'],
['ch1-2','What is a context window, and why does its size not settle the problem?','The total tokens a model can attend to in one request. Long windows still lose information placed in the middle and cost more per call.'],
['ch1-3','What is an eval?','A repeatable test of model or system output against criteria, scored by code, a model judge or a person, used to decide whether a change is better.'],
['ch1-4','What does RAG add to a model?','Retrieved, up-to-date or private documents placed in the prompt, so answers are grounded in sources the model was not trained on.'],
['ch1-5','What is MCP?','The Model Context Protocol: an open standard for exposing tools, data and prompts to models through servers any compatible client can call.']],
ch2:[
['ch2-1','Which enterprise GenAI use cases are most proven in production?','Coding assistants, customer support copilots, enterprise search with RAG, and document extraction and summarisation.'],
['ch2-2','What usually blocks pilots from reaching production?','Missing evals, guardrails and observability, unclear ownership, and no measured business metric.'],
['ch2-3','What question should you ask before approving an AI use case?','What does it replace today, and how will we measure that it is better?']],
ch3:[
['ch3-1','Which three properties trade off when choosing a model?','Quality, latency and cost. The right model can differ for each step of the same product.'],
['ch3-2','Why are public leaderboards a weak basis for model choice?','They rarely match your task, data or constraints. Re-run candidates on your own eval set.'],
['ch3-3','When is a reasoning model worth its extra latency and cost?','For multi-step planning, maths, code and hard analysis; not for simple extraction or classification.'],
['ch3-4','Why plan a fallback model?','Providers have outages, rate limits and deprecations. A tested fallback keeps the product running.']],
ch4:[
['ch4-1','What should exist before you build an AI feature?','A defined task, a success metric and an eval set, not a chat interface.'],
['ch4-2','Why does a narrow task often beat a broad assistant?','Narrow tasks can be evaluated and made reliable; a broad assistant that is right 70% of the time loses trust.'],
['ch4-3','What is a common design trap with GenAI products?','Building because a demo impressed people, without the data, workflow or metric to support it.']],
ch5:[
['ch5-1','What are the six parts of a working prompt?','Role, task, context, examples, output format and constraints.'],
['ch5-2','How should prompting a reasoning model differ?','Use simpler, direct prompts with a precise task definition; avoid scripting the reasoning steps.'],
['ch5-3','Why define the output format carefully?','The format is the interface to the next system. Use structured output with a schema where possible.'],
['ch5-4','When should you stop iterating on a prompt?','When eval scores plateau. Move to better retrieval, fine-tuning or a different architecture.'],
['ch5-5','What are few-shot examples, and why do they matter?','Worked input-output examples in the prompt. Often the highest-leverage way to fix format and edge cases.']],
ch6:[
['ch6-1','What is the 80/20 flip in AI engineering?','Most of the work is evaluation and iteration, not the first build.'],
['ch6-2','What is criteria drift?','You only learn what good output looks like by grading real outputs, so criteria change as you review.'],
['ch6-3','What should an eval set contain?','Representative real cases, known edge cases and past failures, each labelled with what a good answer looks like.'],
['ch6-4','Why is shipping on vibe checks risky?','A few hand-picked examples say little about the distribution of real inputs, so regressions go unseen.']],
ch7:[
['ch7-1','What can code-based evals check well?','Format, schema validity, required fields, exact facts, length, and whether expected sources are cited.'],
['ch7-2','What can code-based evals not judge?','Tone, helpfulness and open-ended correctness. Use a calibrated judge or people for those.'],
['ch7-3','Where should evals run?','In CI on every prompt, model or retrieval change, with a score threshold that blocks the release.'],
['ch7-4','How do BLEU and ROUGE differ?','BLEU measures n-gram precision against a reference; ROUGE measures recall of reference n-grams. Both miss meaning.']],
ch8:[
['ch8-1','What does calibrating an LLM judge mean?','Measuring how often it agrees with expert human labels and adjusting the rubric until agreement is acceptable.'],
['ch8-2','Name three known biases of LLM judges.','Position bias, verbosity bias and self-preference for their own model family.'],
['ch8-3','Why prefer binary pass/fail judges?','They are easier to calibrate and act on than 1-to-10 scales, which drift and cluster.'],
['ch8-4','What is G-Eval?','A judge that generates evaluation steps with chain-of-thought from criteria, then scores the output.'],
['ch8-5','What is an LLM jury?','Several judges score independently and their scores are aggregated, which reduces single-judge bias.']],
ch9:[
['ch9-1','What is indirect prompt injection?','Malicious instructions hidden in content the model reads, such as web pages, documents or tool output.'],
['ch9-2','Why are input filters not enough?','Injection can arrive through retrieved documents and tool results that input filters never see.'],
['ch9-3','Where should the strictest guardrails go?','Where the damage would be highest: irreversible actions, sensitive data and external messages.'],
['ch9-4','What does a guardrail cost?','Added latency and false positives that block valid requests.']],
ch10:[
['ch10-1','What are the steps from a single call to an agent?','Single call, pipeline, workflow, then an agent that chooses its own next step.'],
['ch10-2','When should you not use an agent?','When the path is known. A fixed workflow is cheaper, faster and easier to test.'],
['ch10-3','What is the basic agent loop?','Call the model, run any tool it requests, add the result to context, repeat until it answers or a stop condition hits.'],
['ch10-4','What is ReAct?','Interleaving reasoning and actions: think, call a tool, observe the result, think again.']],
ch11:[
['ch11-1','Name the five workflow patterns from Building Effective Agents.','Prompt chaining, routing, parallelisation, orchestrator-workers and evaluator-optimiser.'],
['ch11-2','What does a router do?','Classifies the input and sends it to a specialised handler or a cheaper model.'],
['ch11-3','How do you know a router is working?','Measure its classification accuracy on its own, not just the end-to-end score.'],
['ch11-4','When is the evaluator-optimiser pattern useful?','When there are clear criteria and iterative feedback measurably improves the output.']],
ch12:[
['ch12-1','What makes a good tool for an agent?','A clear name and description, typed parameters, a narrow purpose and short, useful responses.'],
['ch12-2','How should tool errors be returned?','As readable messages the model can act on, not stack traces or silent empty results.'],
['ch12-3','What is tool definition bloat?','Too many vague tools in context, which wastes tokens and causes wrong tool choices.'],
['ch12-4','Which tool calls need a person to approve them?','Irreversible or high-impact ones: payments, deletions and messages sent outside the system.']],
ch13:[
['ch13-1','What is hybrid search?','Combining keyword (BM25) and vector retrieval, usually merged with reciprocal rank fusion.'],
['ch13-2','What does a reranker do?','Rescores the top retrieved candidates with a stronger model, usually a cross-encoder, before they reach the prompt.'],
['ch13-3','What is contextual retrieval?','Adding a short description of the document to each chunk before embedding, so chunks keep their meaning.'],
['ch13-4','What are recall@k and precision@k?','Recall@k: share of relevant documents found in the top k. Precision@k: share of the top k that are relevant.'],
['ch13-5','Where do most RAG failures start?','Retrieval: bad chunking, parsing or ranking means the right context never reaches the model.'],
['ch13-6','What is MRR?','Mean reciprocal rank: the average of 1 divided by the rank of the first relevant result.']],
ch14:[
['ch14-1','What kinds of memory does an agent use?','Working memory in the context, short-term session state, and long-term stored facts or episodes.'],
['ch14-2','What is the main risk of long-term memory?','Stale or wrong facts persist and are treated as true, and private data accumulates.'],
['ch14-3','What should users be able to do with an agent\'s memory?','See it, correct it and delete it.']],
ch15:[
['ch15-1','What does a multi-agent system cost?','More tokens, latency and failure points, plus coordination and shared-state problems.'],
['ch15-2','What is the orchestrator-worker pattern?','A lead agent splits the task, sub-agents work on parts in parallel, and the lead combines the results.'],
['ch15-3','What is the argument against multi-agent systems?','Splitting work loses shared context, so agents make conflicting decisions. One agent with good context is often better.'],
['ch15-4','What question tests whether you need multiple agents?','What would break if this were one agent with more tools?']],
ch16:[
['ch16-1','What should a trace capture for an LLM request?','Prompt and version, model, retrieved context, tool calls, outputs, tokens, latency per step and user or tenant id.'],
['ch16-2','Why can a failure be impossible to reproduce?','Prompt, context or model version was not logged.'],
['ch16-3','What are the OpenTelemetry GenAI semantic conventions?','A vendor-neutral standard for naming spans and attributes for model and tool calls.'],
['ch16-4','What is the cost of logging everything?','Storage, and privacy risk. Decide what to keep, redact PII and set retention.']],
ch17:[
['ch17-1','What does an MCP server expose?','Tools, resources and prompts that any MCP client can discover and call.'],
['ch17-2','What risk do third-party MCP servers bring?','They run with your agent\'s permissions and can change tool descriptions to inject instructions.'],
['ch17-3','How do MCP and A2A differ?','MCP connects a model to tools and data. A2A is for agents talking to other agents.']],
ch18:[
['ch18-1','What should happen when the model provider is down?','Fall back to another model or a degraded mode, with timeouts and retries that do not pile up.'],
['ch18-2','Why set budget alerts on LLM spend?','A retry loop or traffic spike can burn a month of budget in hours.'],
['ch18-3','Name four items on an LLM production checklist.','Evals in CI, tracing, guardrails, fallbacks, rate limits, cost alerts and a rollback plan for prompts.']],
ch19:[
['ch19-1','What does a platform lead need compared with a specialist?','Breadth across evals, retrieval, agents, serving, cost and governance, rather than depth in one area.'],
['ch19-2','How do you keep learning from staying theoretical?','Build and measure something each quarter.']],
ch20:[
['ch20-1','Which trends shape the next few years of AI engineering?','Reasoning models, longer agent runs, open models, multimodal input and regulation.'],
['ch20-2','How should roadmaps handle fast model change?','Make bets with exit criteria and review dates instead of rebuilding around every launch.']],
gaps:[
['gaps-1','What is a principal AI platform engineer expected to reason about?','Shared gateway, evals, guardrails, observability, cost, data governance and build-versus-buy across teams.'],
['gaps-2','What does hidden technical debt in ML systems refer to?','Glue code, data dependencies and feedback loops make ML systems costly to maintain beyond the model itself.']],
capstone:[
['capstone-1','What should a capstone demo include besides the app?','Eval scores, latency and cost per request, and what failed.'],
['capstone-2','Why keep the capstone small?','Finishing end to end, with evals and monitoring, teaches more than an ambitious project left at 80%.']],
knowledge:[
['knowledge-1','Where should access controls be applied in RAG?','Before or during retrieval, as metadata filters, never after content is in the prompt.'],
['knowledge-2','What is HNSW?','A graph-based approximate nearest-neighbour index that trades a little recall for fast search.'],
['knowledge-3','Why does ingestion matter so much?','Bad parsing of PDFs, tables and layouts produces chunks that no retriever can fix.']],
graphrag:[
['graphrag-1','When does GraphRAG beat vector RAG?','Multi-hop questions and whole-corpus questions that need connections or summaries across documents.'],
['graphrag-2','What is the difference between local and global search in Microsoft GraphRAG?','Local search starts from entities near the query. Global search uses community summaries to answer corpus-wide questions.'],
['graphrag-3','What does GraphRAG cost?','Expensive LLM-based extraction to build the graph, and work to refresh it as documents change.'],
['graphrag-4','What is HyDE?','Generating a hypothetical answer and embedding it instead of the raw query to improve retrieval.'],
['graphrag-5','What does Corrective RAG do?','Grades retrieved documents and falls back to other sources, such as web search, when retrieval is poor.']],
'adv-eng':[
['adv-eng-1','What is Reflexion?','An agent writes a critique of its failed attempt and uses it as memory on the next try.'],
['adv-eng-2','What does PagedAttention do?','Stores the KV cache in fixed-size pages, like OS virtual memory, so serving wastes less GPU memory.'],
['adv-eng-3','How does a semantic cache differ from prompt caching?','A semantic cache returns a stored answer for a similar query. Prompt caching reuses computation for an identical prefix.'],
['adv-eng-4','How do you know an advanced pattern helps?','Measure eval scores, latency and cost with and without it.']],
'adv-dl':[
['adv-dl-1','What does LoRA train?','Small low-rank adapter matrices added to frozen weights, instead of all parameters.'],
['adv-dl-2','How does QLoRA differ from LoRA?','It trains LoRA adapters on a 4-bit quantised base model, so large models fit on one GPU.'],
['adv-dl-3','What does DPO remove compared with RLHF?','The separate reward model and reinforcement learning loop; it optimises directly on preference pairs.'],
['adv-dl-4','What is a mixture of experts?','A model where a router sends each token to a few of many expert sub-networks, so only part of the model runs per token.'],
['adv-dl-5','When should you fine-tune?','After prompting and retrieval have plateaued on your eval set, for format, style or narrow tasks at high volume.']],
sysdesign:[
['sysdesign-1','What are TTFT and TPOT?','Time to first token, set mostly by prefill; and time per output token, set by decode speed.'],
['sysdesign-2','Why is decode memory-bandwidth bound?','Each step reads all weights and the KV cache to produce one token per sequence.'],
['sysdesign-3','What is continuous batching?','Rebuilding the batch at every decode step so new requests join as soon as others finish.'],
['sysdesign-4','What is prefill-decode disaggregation?','Running prompt processing and token generation on separate GPU pools so long prompts do not stall streaming.'],
['sysdesign-5','How do you estimate cost per million tokens?','GPU hourly price divided by tokens per second times 3,600 times utilisation, times one million.'],
['sysdesign-6','Why is GPU utilisation a poor autoscaling signal?','Memory-bound decode can look busy at any load. Scale on queue depth, KV-cache use and latency targets.']],
frontier:[
['frontier-1','How are reasoning models like DeepSeek-R1 trained?','Reinforcement learning on tasks with verifiable rewards, such as maths and code, which teaches long chains of reasoning.'],
['frontier-2','What is test-time compute scaling?','Spending more compute at inference, by thinking longer or sampling more, to improve answers instead of using a bigger model.'],
['frontier-3','What trend does METR\'s long-tasks study measure?','The length of tasks, in human time, that agents can complete, which has been doubling every few months.'],
['frontier-4','When is a distilled small model enough?','When production data shows the task is narrow and the small model matches the large one on your eval set.']],
'agent-econ':[
['agent-econ-1','Why measure cost per completed task rather than per token?','Agents use many calls per task; the user pays for outcomes, so margins depend on task cost.'],
['agent-econ-2','How do you raise an agent\'s autonomy safely?','Start with approval on actions, measure error rates, then remove approval step by step where it is reliable.'],
['agent-econ-3','How do you design for model churn?','A model layer you can swap, with upgrades gated by your eval set.']],
'ai-org':[
['ai-org-1','What belongs on a central AI platform?','Gateway, eval service, guardrails, observability and cost controls as shared, self-service paved roads.'],
['ai-org-2','What are the three parts of a written strategy?','A diagnosis, a guiding policy and coherent actions.'],
['ai-org-3','What metrics show AI impact?','Adoption, quality, cost and time saved on real work, not usage counts alone.']],
governance:[
['governance-1','How does the EU AI Act classify systems?','By risk: prohibited, high risk, limited risk with transparency duties, and minimal risk.'],
['governance-2','What are the four functions of the NIST AI RMF?','Govern, map, measure and manage.'],
['governance-3','What is ISO/IEC 42001?','A certifiable standard for an organisation\'s AI management system.'],
['governance-4','What must you be able to reconstruct for a disputed AI decision?','The model, prompt version, retrieved data and inputs that produced it.']],
pov:[
['pov-1','What makes a design memo useful?','One page: the decision, the options, the evidence and the recommendation.'],
['pov-2','Why publish experiments rather than opinions?','A reproducible repo with an eval is evidence others can check and build on.']],
'ctx-eng':[
['ctx-eng-1','What are the four strategies of context engineering?','Write context outside the window, select it just in time, compress it, and isolate it in sub-agents.'],
['ctx-eng-2','What is context rot?','Recall and instruction-following degrade as the context fills, even within the model\'s limit.'],
['ctx-eng-3','Why order prompts with the stable parts first?','So prompt caching reuses the prefix, which cuts cost and latency.'],
['ctx-eng-4','How do sub-agents help with context?','Each starts with a clean, focused context and returns only a short result to the main agent.'],
['ctx-eng-5','What is compaction?','Summarising older history when the context reaches a threshold, keeping decisions and open tasks.']],
harness:[
['harness-1','What does "agent = model + harness" mean?','The model reasons; the harness supplies the loop, tools, context, state, permissions and tracing.'],
['harness-2','Name four stop conditions an agent loop needs.','Maximum steps, time limit, cost cap and loop detection, plus a way to hand back to a person.'],
['harness-3','What are hooks in an agent harness?','Code that runs before or after tool calls or turns, to check, block, log or modify actions.'],
['harness-4','How do you evaluate a harness on its own?','Hold the model fixed and compare harness versions on the same task set, tracing every step.'],
['harness-5','Why persist agent state?','So a run can resume after a crash or hand over between sessions without starting again.']],
'coding-agents':[
['coding-agents-1','What becomes the bottleneck when agents write code?','Specifying the work, reviewing changes and testing them.'],
['coding-agents-2','What goes in an instruction file such as CLAUDE.md or AGENTS.md?','Build and test commands, conventions, architecture notes and known gotchas for the repo.'],
['coding-agents-3','Why are tests the contract for coding agents?','The agent can check its own work against them; weak tests let confident but wrong changes through.'],
['coding-agents-4','Which metrics show whether coding agents help delivery?','Lead time, change failure rate and review load, not lines of code.']],
'agent-security':[
['agent-security-1','What is the lethal trifecta?','Access to private data, exposure to untrusted content, and a way to send data out. Together they allow exfiltration.'],
['agent-security-2','How should an agent authenticate when acting for a user?','With scoped, short-lived credentials delegated by that user, never a shared service key.'],
['agent-security-3','What is MCP tool poisoning?','A tool description containing hidden instructions that hijack the agent.'],
['agent-security-4','What is the key question for agent threat modelling?','If an attacker controls one input the agent reads, what is the worst action they can trigger?']],
'agent-evals':[
['agent-evals-1','How do outcome and trajectory evaluation differ?','Outcome checks the end state. Trajectory checks the path: tool choices, order and waste.'],
['agent-evals-2','Why run each agent task several times?','Agents are non-deterministic; report the pass rate and its spread, not a single run.'],
['agent-evals-3','What does tau-bench add to agent evaluation?','Simulated users and policy rules, and a consistency metric across repeated runs.'],
['agent-evals-4','Where do the best agent regression tests come from?','Real production failures turned into test cases.']],
'data-flywheel':[
['data-flywheel-1','What is a data flywheel?','Production usage creates feedback and examples that improve evals, prompts, retrieval or models, which improves usage.'],
['data-flywheel-2','What is error analysis?','Reading failures, grouping them into categories and fixing the largest category first.'],
['data-flywheel-3','Which signals count as implicit feedback?','Retries, edits, copying the answer and abandoned sessions.'],
['data-flywheel-4','What is feedback bias?','Optimising for what users rate highly rather than what is correct, which can reinforce errors.']]
};
