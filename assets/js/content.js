// Page structure for the roadmap: topic metadata, topic groups, learning flows and the change log.
// Topic ids are the section ids in data.js. Slugs appear in shared links, so never change a slug once published;
// add an entry to LEGACY instead if one must move.

// Levels, in order. A topic's level sets its column in the skill graph.
const LEVELS=[
  ['know','Know','Vocabulary and mental models'],
  ['build','Build','Working systems, end to end'],
  ['ship','Ship','Evals, reliability, cost'],
  ['lead','Lead','Architecture and platform choices for a team'],
  ['shape','Shape','Strategy and where the field is going']];

// [id, slug, short title, level, hours, prerequisite ids, senior lens [trade-off, failure in production, design-review question]]
const TOPIC_META=[
['ch1','vocabulary','Vocabulary','know',3,[],['Precision of language versus speed: teams that share exact terms (agent vs workflow, eval vs test) make faster decisions.','A team says "agent" for a fixed pipeline, then is surprised by a step budget or a loop it never designed.','Which word in this design doc would two engineers on the team define differently?']],
['ch2','enterprise-use-cases','What enterprises build','know',2,[],['Ambition versus proof: copilots and retrieval are proven; fully autonomous back-office agents are still mostly pilots.','A use case is chosen because a competitor demoed it, not because the data and workflow exist.','What does this replace today, and how will we know it is better?']],
['ch3','model-selection','Choosing models','know',3,[],['Quality, latency and cost pull against each other; the right model differs per step of the same product.','A model is picked from a leaderboard and never re-checked against the product\'s own eval set.','Which model would we fall back to tomorrow, and what would we lose?']],
['ch4','problem-first-design','Problem-first design','know',2,[],['Scope versus delight: a narrow task done reliably beats a broad assistant that is right 70% of the time.','The team builds a chat interface before defining a single success metric.','What is the smallest version of this that a user would pay for or rely on?']],
['ch5','prompting-and-context','Prompting and context','know',4,[],['More context helps until it hurts: long prompts cost latency and money, and bury the instruction that matters.','Prompts edited in production with no version, no eval and no rollback.','How is this prompt versioned, tested and rolled back?']],
['ch6','why-evals','Why evals are the real work','ship',2,['ch4'],['Time spent on evals feels slow at first and is the only thing that makes later changes fast.','Shipping on "looks good to me" from five hand-picked examples.','What is the eval set, who labelled it, and what score blocks a release?']],
['ch7','code-based-evals','Code-based evals','ship',4,['ch13'],['Cheap, deterministic checks cover format and facts; they cannot judge tone or usefulness.','Evals exist but run only when someone remembers, so regressions ship.','Which of these checks run in CI on every prompt or model change?']],
['ch8','llm-as-judge','LLM as judge','ship',4,['ch13'],['A judge scales review, but it needs calibration against humans, and it drifts when the judge model changes.','An uncalibrated judge agrees with itself and rewards verbose answers.','How well does the judge agree with human labels, and when did we last check?']],
['ch9','guardrails','Guardrails','ship',3,['ch12'],['Every guardrail adds latency and false positives; put the strictest ones where the damage is highest.','Prompt injection through retrieved documents or tool output, which input filters never saw.','What is the worst action this system can take, and what stops it?']],
['ch10','single-calls-to-agents','From single calls to agents','build',3,['ch5'],['Each step up from single call to pipeline to agent buys flexibility and costs predictability.','An agent is used where a three-step workflow would have been cheaper, faster and easier to test.','Why does this need an agent rather than a fixed workflow?']],
['ch11','workflow-patterns','Workflow and router patterns','build',3,['ch4'],['Routers cut cost by sending easy work to small models, at the price of one more component to evaluate.','A router misclassifies a slice of traffic and nobody notices because only overall scores are tracked.','How do we measure the router\'s accuracy on its own?']],
['ch12','tool-use','Tool use and actions','build',4,['ch5'],['Broad tools make agents capable and dangerous; narrow, typed tools are easier to secure and test.','A tool with write access is exposed without confirmation, rate limits or an audit log.','Which tool calls are irreversible, and who approves them?']],
['ch13','rag','Retrieval (RAG)','build',5,['ch5'],['Better retrieval usually beats a bigger model; chunking and ranking deserve more time than the prompt.','Answers look grounded, but retrieval recall was never measured, so missing context goes unseen.','What is recall@k on real questions, and how was it measured?']],
['ch14','memory','Memory and long-running agents','build',3,['ch5'],['Remembering more improves continuity and raises privacy, cost and staleness risk.','Memory accumulates stale or wrong facts that the agent then treats as true.','What does the agent forget, when, and can a user see and delete what it remembers?']],
['ch15','multi-agent','Multi-agent systems','lead',3,['ch11','ch14'],['Multiple agents parallelise work and multiply cost, latency and failure points.','Agents talk in circles or duplicate work because there is no shared state or stop condition.','What would break if this were one agent with more tools?']],
['ch16','observability','Observability and tracing','ship',3,['ch10'],['Logging everything helps debugging and creates privacy and storage cost; decide what to keep and for how long.','A user-reported failure cannot be reproduced because prompts, retrieved context and model version were not logged.','Can we replay any production request end to end?']],
['ch17','protocols','Protocols and extensibility','ship',3,['ch12'],['Standard protocols such as MCP make integration cheap and widen the attack surface.','A third-party tool server is trusted with the same permissions as first-party code.','Which external servers can this agent call, and with whose credentials?']],
['ch18','production-readiness','Production readiness','ship',3,['ch14'],['Every checklist item slows the first launch and speeds up every incident after it.','No budget alerts, so a retry loop burns a month of spend in a weekend.','What happens when the provider is down, slow or returns garbage?']],
['ch19','learning-tracks','Learning tracks','lead',2,['ch6'],['Breadth versus depth: a platform lead needs breadth, a specialist needs depth in one area.','Learning stays theoretical because nothing is built and measured.','What will you have built by the end of this quarter?']],
['ch20','horizon','The horizon','shape',2,['ch19'],['Betting early on a trend gives an advantage and risks building on something that fades.','Roadmaps rebuilt around every model launch.','Which of our assumptions would a model twice as capable break?']],
['gaps','role-gaps','Principal platform role gaps','lead',6,['ch18'],['Depth in one area versus enough breadth to make platform calls across many.','A senior engineer is strong in models but cannot explain the cost or governance side of a platform.','Which part of the platform could you not defend in a design review today?']],
['oreilly','reading-list','O\'Reilly reading list','lead',20,[],['Books give structure and lag the field by a year; pair each with current papers and posts.','Reading without applying, so nothing sticks.','Which chapter changed a decision you made this month?']],
['labs','labs','Hands-on labs','build',15,[],['Guided labs build skill quickly but do not teach scoping a messy real problem.','Labs finished, nothing original built.','What did you change in the lab that the lesson did not ask for?']],
['capstone','capstone','Capstone project','ship',20,['ch13'],['Scope versus finish: a small capstone done end to end beats an ambitious one left at 80%.','A demo with no eval and no cost numbers.','What are the eval scores, latency and cost per request?']],
['courses','courses','Courses','know',10,[],['Courses are efficient for foundations and weak on production judgment.','Collecting certificates instead of building.','What will you build with this course\'s material?']],
['opensource','open-source-courses','Open-source courses','know',0,[],null],
['youtube','youtube','YouTube channels','know',4,[],['Video is fast for intuition and poor for reference; take notes you can search.','Watching passively without trying the code.','Which idea from this video did you try the same day?']],
['blogs','blogs','Blogs and newsletters','know',0,[],null],
['papers','papers','Key research papers','lead',10,[],['Papers show what is possible, not what is production ready.','Adopting a technique from a paper without checking it on your own data.','What would it take to reproduce this result on our data?']],
['knowledge','knowledge-systems','Knowledge systems depth','build',4,['ch3'],['Investment in ingestion and metadata pays off more than retrieval tricks layered on top.','Permissions applied after retrieval, so restricted content leaks into the prompt.','Where are access controls enforced: before or after retrieval?']],
['graphrag','graphrag','GraphRAG and advanced retrieval','lead',6,['knowledge','ch7'],['Graph indexes answer multi-hop and whole-corpus questions and cost far more to build and refresh than vector indexes.','A GraphRAG index built for a corpus where plain hybrid search was enough.','Which questions fail with vector search today, and does the graph fix them?']],
['adv-eng','advanced-engineering','Advanced engineering','lead',8,['ch16','ch9'],['Patterns such as reflection and routing add quality and add latency and cost per request.','Advanced patterns stacked without evals, so nobody knows which ones help.','What did each added pattern change in the eval scores?']],
['adv-dl','deep-learning','Deep learning and math','lead',12,['ch3'],['Fine-tuning gives control and lower inference cost, and it adds a training pipeline you must maintain.','Fine-tuning to fix what was really a retrieval or prompt problem.','What did prompting and retrieval achieve before we chose to fine-tune?']],
['sysdesign','llm-serving','LLM serving and system design','lead',6,['ch18'],['Self-hosting trades API simplicity for control over cost, latency and data, and needs GPU and serving skills.','Capacity planned on average load, so peak traffic queues and latency targets fail.','What are TTFT and TPOT at p95 under peak load, and what does a million tokens cost us?']],
['frontier','frontier-models','Frontier models','shape',5,['adv-dl'],['Reasoning models raise quality on hard tasks and raise latency and cost on easy ones.','Every request sent to the most capable reasoning model.','Which requests actually need extended reasoning?']],
['agent-econ','agent-economics','Agent economics','shape',4,['ch15'],['Autonomy saves human time and moves risk onto the system; price and design for both.','A feature that is popular and loses money on every task.','What is the cost per completed task, and what does the user pay for it?']],
['ai-org','ai-strategy','AI platform strategy','shape',4,['gaps'],['A central platform brings consistency and can slow product teams if it becomes a gate.','Every team builds its own gateway, eval harness and guardrails.','Which shared services would save the most duplicate work across teams?']],
['governance','ai-governance','Governance and regulation','shape',4,['ch9'],['Governance slows launches and is cheaper than retrofitting after a regulator or an incident.','No record of which model, prompt and data produced a disputed decision.','Could we explain any individual decision this system made last month?']],
['pov','point-of-view','Your point of view','shape',6,['gaps'],['Writing in public builds influence and exposes your reasoning to criticism; both make you better.','Experience that stays in your head and in private chats.','What do you believe about AI engineering that most of your peers do not?']]
];

// Topic groups for the Topics index and the sidebar. Order matters.
const GROUPS=[
  ['Foundations',['ch1','ch2','ch3','ch4','ch5']],
  ['Evaluation',['ch6','ch7','ch8','ch9']],
  ['Agentic systems',['ch10','ch11','ch12','ch14','ch15','ch17']],
  ['Knowledge systems',['ch13','knowledge','graphrag']],
  ['Production',['ch16','ch18','capstone','sysdesign']],
  ['Advanced',['adv-eng','adv-dl']],
  ['Leadership and vision',['gaps','ch19','ch20','frontier','agent-econ','ai-org','governance','pov']],
  ['Library',['labs','oreilly','courses','opensource','youtube','blogs','papers']]];

// Learning flows: an ordered path through topics. [slug, title, icon, level label, description, step topic ids, build-this exercise]
const FLOWS=[
['fast-foundations','Fast foundations','zap','Know','Chapters 1–5 condensed for people who have shipped software for years. Mostly a weekend of skimming.',['ch1','ch2','ch3','ch4','ch5'],'Write a one-page model selection memo for a product you know: the task, three candidate models, an eval plan and the cost per thousand requests.'],
['evals','Evals as a discipline','flask-conical','Ship','From why evals matter to code checks, calibrated judges, guardrails and tracing.',['ch6','ch7','ch8','ch9','ch16'],'Build an eval suite of 50 labelled cases with code checks and a calibrated LLM judge, running in CI on every prompt change.'],
['production-rag','Production RAG to GraphRAG','database','Build → Lead','Retrieval that holds up in production, then graph-based and agentic retrieval for the questions it cannot answer.',['ch13','knowledge','graphrag','capstone'],'Build a hybrid retriever over your own documents with recall@10 measured, then compare a GraphRAG index on 20 multi-hop questions.'],
['agentic-systems','Agentic systems','bot','Build → Lead','Single calls to agents: workflows, tools, memory, multi-agent patterns, protocols and red teaming.',['ch10','ch11','ch12','ch14','ch15','ch17','adv-eng'],'Build an agent with three tools, a step budget, traced runs and an adversarial test set it must pass.'],
['llm-serving','LLM serving and infrastructure','server','Lead','How a request reaches a GPU and back, and what it costs: routing, batching, caching, sizing and readiness.',['sysdesign','adv-eng','ch16','ch18'],'Serve an open model with vLLM, load-test it, and report TTFT and TPOT at p95 and the cost per million tokens.'],
['models','Models: fine-tuning and internals','cpu','Lead','Choosing, tuning and compressing models. Optional for most product engineers, essential for platform leads.',['ch3','adv-dl','papers'],'Fine-tune a small model with LoRA on one narrow task and beat a prompted baseline on your eval set.'],
['platform-leadership','AI platform leadership','building-2','Lead','The gaps between a strong senior engineer and a principal AI platform engineer.',['gaps','ch18','ch19','oreilly','governance'],'Write a platform proposal: a shared gateway, eval service, guardrails and cost controls for five product teams.'],
['shaping-the-field','Shaping the field','telescope','Shape','Where the field is heading and how to have a view on it: frontier models, agent economics, strategy, governance and your own point of view.',['ch20','frontier','agent-econ','ai-org','governance','pov'],'Publish a 1,500-word point of view on one open question in AI engineering, with evidence from your own experiment.']];

// Old links that must keep working. Section ids (#ch13) redirect automatically.
const LEGACY={tracker:'progress',map:'flows',guide:'flows'};

// Change log, newest first: [ISO date, title, detail]
const NEWS=[
['2026-10-04','Skill graph in colour, full width','Each level has its own colour, the graph stretches across the screen, and selecting a topic highlights what it builds on and leads to.'],
['2026-10-04','Redesign: flows, topics and the skill graph','Eight learning flows, a page per topic with a Senior lens, a skill graph on larger screens, a link on every page and heading, and Lucide icons in place of emoji.'],
['2026-10-04','Shaping the field','Five new topics: frontier models, agent economics, AI platform strategy, governance and your own point of view.'],
['2026-10-04','Map view','Route and depth views of progress. Now part of Flows and the skill graph.'],
['2026-10-04','GraphRAG and advanced retrieval','Knowledge graphs, hierarchical and multi-hop retrieval, Self-RAG and Corrective RAG.'],
['2026-10-02','LLM serving guide','An interactive walk through the serving stack, with GPU sizing and cost calculators.']];

// Descriptions for reading-list pages that have no checklist in data.js.
const EXTRA_DESC={opensource:'Free, hands-on alternatives covering the same material as the paid courses.',blogs:'Writers doing the best applied and research-grade AI engineering content.'};

// Companion pages linked from a topic: [href, title, note]
const TOPIC_LINKS={sysdesign:['system-design.html','The LLM serving stack, stop by stop','Interactive guide: 13 stops from your app to the GPU and back, with GPU sizing and cost calculators.']};
