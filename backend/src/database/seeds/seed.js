require('../../config/env');
const pool = require('../../config/db');

const techniques = [
  {
    name: 'Appeal to Fear',
    definition: 'Using fear to persuade an audience by exaggerating threats or dangers.',
    real_examples: ['"If we don\'t act now, our way of life will be destroyed."', '"Crime is at an all-time high — your family is not safe."'],
    psychology: 'Fear activates the amygdala, bypassing rational analysis and pushing people toward fight-or-flight decisions.',
    how_to_recognize: 'Look for exaggerated threats, worst-case scenarios presented as inevitable, and urgent calls to action based on danger.',
    how_to_avoid: 'Ask: What is the actual probability of this threat? What evidence supports the severity claimed?',
  },
  {
    name: 'Bandwagon',
    definition: 'Encouraging people to adopt a position because "everyone else" is doing so.',
    real_examples: ['"Millions of people have already joined — don\'t be left behind."', '"The whole country supports this policy."'],
    psychology: 'Exploits social conformity bias — humans are wired to align with perceived group consensus for safety.',
    how_to_recognize: 'Phrases like "everyone knows," "most people agree," or large crowd imagery without substantive argument.',
    how_to_avoid: 'Ask: Is popularity evidence of correctness? What do the actual numbers say, and who was surveyed?',
  },
  {
    name: 'Name Calling',
    definition: 'Attaching a negative label to a person or idea to discredit it without evidence.',
    real_examples: ['"Only extremists would support that policy."', '"She\'s a radical — don\'t listen to her."'],
    psychology: 'Labels trigger emotional associations, short-circuiting evaluation of the actual argument.',
    how_to_recognize: 'Dismissive labels used instead of engaging with the substance of an argument.',
    how_to_avoid: 'Separate the label from the argument. Evaluate the claim on its own merits.',
  },
  {
    name: 'False Dilemma',
    definition: 'Presenting only two options when more exist, forcing a binary choice.',
    real_examples: ['"You\'re either with us or against us."', '"We can either cut services or raise taxes — there is no other way."'],
    psychology: 'Limits perceived choices, creating artificial urgency and preventing exploration of alternatives.',
    how_to_recognize: 'Either/or framing, "only two options" language, absence of nuance or middle ground.',
    how_to_avoid: 'Ask: Are these truly the only options? What alternatives are being excluded and why?',
  },
  {
    name: 'Ad Hominem',
    definition: 'Attacking the person making an argument rather than the argument itself.',
    real_examples: ['"We can\'t trust his economic plan — he\'s been divorced three times."', '"She failed a class in college, so her research is worthless."'],
    psychology: 'Shifts focus from logic to character, exploiting our tendency to evaluate sources over substance.',
    how_to_recognize: 'Personal attacks, irrelevant biographical details used to dismiss arguments.',
    how_to_avoid: 'Ask: Does this personal information actually affect the validity of the argument presented?',
  },
  {
    name: 'Cherry Picking',
    definition: 'Selecting only evidence that supports a conclusion while ignoring contradictory data.',
    real_examples: ['"Studies show our product works" (citing only favorable studies).', 'Reporting only crime statistics that support a narrative.'],
    psychology: 'Confirmation bias makes cherry-picked evidence feel complete and convincing.',
    how_to_recognize: 'One-sided evidence, absence of counterexamples, no acknowledgment of conflicting data.',
    how_to_avoid: 'Ask: What evidence exists on the other side? Has the full body of research been considered?',
  },
  {
    name: 'Glittering Generalities',
    definition: 'Using vague, emotionally appealing words that sound positive but lack specific meaning.',
    real_examples: ['"We stand for freedom, justice, and the American way."', '"This policy is about family, community, and values."'],
    psychology: 'Positive emotional words create approval without requiring substantive evaluation.',
    how_to_recognize: 'Abstract virtue words (freedom, justice, progress) used without concrete definition or policy detail.',
    how_to_avoid: 'Ask: What specifically does this mean? What concrete actions or policies are being proposed?',
  },
  {
    name: 'Transfer',
    definition: 'Associating a respected symbol, person, or institution with an idea to lend it credibility.',
    real_examples: ['Placing a candidate next to a religious symbol.', 'Using a scientist\'s image to endorse an unrelated product.'],
    psychology: 'Halo effect — positive associations transfer from a trusted source to an unrelated claim.',
    how_to_recognize: 'Symbolic imagery, celebrity or authority endorsements unrelated to the claim\'s substance.',
    how_to_avoid: 'Ask: Does this person or symbol have relevant expertise? Is the association logically connected?',
  },
  {
    name: 'Plain Folks',
    definition: 'A speaker presents themselves as an ordinary person to gain trust and relatability.',
    real_examples: ['"I\'m just a regular guy who wants what\'s best for this town."', 'A wealthy politician eating at a diner for photo opportunities.'],
    psychology: 'In-group bias — we trust people we perceive as similar to ourselves.',
    how_to_recognize: 'Deliberate displays of ordinariness, folksy language, or "common man" imagery from powerful figures.',
    how_to_avoid: 'Ask: Does their background actually match this image? Are their policies consistent with ordinary people\'s interests?',
  },
  {
    name: 'Card Stacking',
    definition: 'Presenting only the strongest arguments for one side while omitting weaknesses.',
    real_examples: ['An advertisement listing only benefits with no mention of side effects.', 'A policy brief that omits all cost estimates.'],
    psychology: 'Incomplete information feels complete; we don\'t miss what we\'re never shown.',
    how_to_recognize: 'Absence of counterarguments, no acknowledgment of trade-offs, one-sided framing.',
    how_to_avoid: 'Ask: What are the downsides? What would a critic of this position say?',
  },
  {
    name: 'Repetition',
    definition: 'Repeating a claim or slogan frequently to make it feel true through familiarity.',
    real_examples: ['Campaign slogans repeated across all media.', 'A talking point repeated verbatim across multiple news segments.'],
    psychology: 'Illusory truth effect — repeated exposure increases perceived credibility regardless of accuracy.',
    how_to_recognize: 'Identical phrases across multiple sources, slogans without supporting evidence.',
    how_to_avoid: 'Ask: Is this claim supported by evidence, or have I just heard it many times?',
  },
  {
    name: 'Scapegoating',
    definition: 'Blaming a specific group for complex problems to deflect from systemic causes.',
    real_examples: ['"Unemployment is high because of immigrants taking jobs."', '"Crime rose because of that community moving in."'],
    psychology: 'Provides a simple, emotionally satisfying explanation for complex problems; channels frustration outward.',
    how_to_recognize: 'A single group blamed for multifaceted problems; absence of systemic or structural analysis.',
    how_to_avoid: 'Ask: What evidence links this group to the problem? What other factors are being ignored?',
  },
];

const learningTopics = [
  { title: 'Introduction to Media Literacy', description: 'Foundational concepts for reading media critically.', order_index: 1 },
  { title: 'Propaganda Techniques', description: 'Recognizing and understanding common persuasion tactics.', order_index: 2 },
  { title: 'Emotional Language', description: 'How emotional framing shapes perception.', order_index: 3 },
];

const badges = [
  { name: 'First Analysis', description: 'Completed your first article analysis.', icon: '🔍' },
  { name: 'Propaganda Spotter', description: 'Identified 5 propaganda techniques.', icon: '🎯' },
  { name: 'Quiz Master', description: 'Scored 100% on a quiz.', icon: '🏆' },
  { name: 'Week Streak', description: 'Analyzed content 7 days in a row.', icon: '🔥' },
  { name: 'Critical Thinker', description: 'Completed all introductory lessons.', icon: '🧠' },
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Ensure the anonymous shared user exists
    await client.query(`
      INSERT INTO users (id, email, name, role)
      VALUES ('00000000-0000-0000-0000-000000000000', 'anon@biasmap.app', 'Anonymous', 'user')
      ON CONFLICT (id) DO NOTHING
    `);
    console.log('✓ Anonymous user ensured');

    for (const t of techniques) {
      await client.query(
        `INSERT INTO propaganda_techniques (name, definition, real_examples, psychology, how_to_recognize, how_to_avoid)
         VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (name) DO NOTHING`,
        [t.name, t.definition, JSON.stringify(t.real_examples), t.psychology, t.how_to_recognize, t.how_to_avoid]
      );
    }
    console.log('✓ Propaganda techniques seeded');

    for (const topic of learningTopics) {
      const { rows } = await client.query(
        `INSERT INTO learning_topics (title, description, order_index)
         VALUES ($1,$2,$3) ON CONFLICT DO NOTHING RETURNING id`,
        [topic.title, topic.description, topic.order_index]
      );
      if (rows.length) {
        const topicId = rows[0].id;
        const { rows: lessonRows } = await client.query(
          `INSERT INTO learning_lessons (topic_id, title, content, order_index)
           VALUES ($1,$2,$3,$4) RETURNING id`,
          [topicId, `${topic.title} — Lesson 1`, `This lesson covers the basics of ${topic.title.toLowerCase()}.`, 1]
        );
        const lessonId = lessonRows[0].id;
        const { rows: quizRows } = await client.query(
          `INSERT INTO quizzes (lesson_id, title) VALUES ($1,$2) RETURNING id`,
          [lessonId, `${topic.title} Quiz`]
        );
        const quizId = quizRows[0].id;
        await client.query(
          `INSERT INTO quiz_questions (quiz_id, question, options, correct_index, explanation, order_index)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [
            quizId,
            'Which of the following best describes media literacy?',
            JSON.stringify(['Believing everything you read', 'Critically evaluating media messages', 'Avoiding all news sources', 'Only reading official sources']),
            1,
            'Media literacy means critically evaluating sources, framing, and techniques rather than accepting or rejecting content wholesale.',
            1,
          ]
        );
      }
    }
    console.log('✓ Learning topics, lessons, quizzes seeded');

    for (const b of badges) {
      await client.query(
        `INSERT INTO badges (name, description, icon) VALUES ($1,$2,$3) ON CONFLICT (name) DO NOTHING`,
        [b.name, b.description, b.icon]
      );
    }
    console.log('✓ Badges seeded');

    // Seed a daily challenge for today so the challenges page works immediately
    await client.query(`
      INSERT INTO challenges (title, description, source_text, correct_answer, xp_reward, active_date)
      VALUES (
        'Spot the Technique',
        'Read the excerpt below and identify the primary propaganda technique being used.',
        'Our nation faces an unprecedented crisis. Every single day, our way of life is under attack. Only by standing together — and acting NOW — can we save everything our ancestors built.',
        $1,
        15,
        CURRENT_DATE
      ) ON CONFLICT (active_date) DO NOTHING
    `, [JSON.stringify({ technique: 'Appeal to Fear' })]);
    console.log('✓ Daily challenge seeded');

    await client.query('COMMIT');
    console.log('Seed complete.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
