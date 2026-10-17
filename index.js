// Storyloom RP Controls v0.4.0: a simple visual steering extension for SillyTavern.
// No external requests, tracking, automatic generations, or preset rewriting.
const STORYLOOM_NAME = 'storyloom_rp_controls';
const STORYLOOM_PROMPT_KEY = 'storyloom_rp_live_tuning';
const STORYLOOM_IN_CHAT = 1;  // SillyTavern extension prompt position.
const STORYLOOM_SYSTEM = 0;   // SillyTavern prompt role.
const STORYLOOM_DEFAULTS = Object.freeze({
  enabled: true, mode: 'yearning', length: 'novel',
  npc: 4, pace: 2, emotion: 4, prose: 4, freshness: 5, extra: ''
});
const STORYLOOM_MODES = Object.freeze({
  tender: {
    description: 'Warmth, teasing, domestic details and all the little things that make affection believable.',
    npc: 4, pace: 2, emotion: 3, prose: 4, freshness: 5,
    direction: 'TENDER PAGES: Allow comforting intimacy, jokes, small errands, fondness and everyday complications. Other characters stay flawed, independent and specific; do not make everyone agreeable.'
  },
  yearning: {
    description: 'Slow-burn chemistry, flawed people, interrupted conversations and deliciously inconvenient feelings.',
    npc: 4, pace: 2, emotion: 4, prose: 5, freshness: 5,
    direction: 'SLOW BURN: Favor credible anticipation, unspoken history, teasing, awkward missteps, reluctant warmth, genuine physical space and incremental romantic shifts. No instant confession or tidy resolution.'
  },
  ruin: {
    description: 'Angst, hard choices, imperfect people and consequences that stay on the page.',
    npc: 5, pace: 3, emotion: 5, prose: 5, freshness: 5,
    direction: 'BEAUTIFUL RUIN: Increase character-rooted conflict, bruised trust, competing loyalties and painful choices when the existing story warrants them. Do not inject pointless cruelty, manufactured twists or melodramatic declarations.'
  }
});
const STORYLOOM_LENGTHS = Object.freeze({
  short: { label: 'A scene: one intimate moment, with room to respond.', direction: 'Favor a concise response of roughly 250-450 words when the context allows. Never rush the player.' },
  detailed: { label: 'A chapter: lively dialogue and textured paragraphs.', direction: 'Favor a developed response of roughly 600-900 words when the context allows. Never pad.' },
  novel: { label: 'Long chapter: rich AO3-style scene writing, never padded.', direction: 'Aim for a substantial response around 1000-1500 words when the current scene supports it, with cohesive paragraphs and natural dialogue. Never pad, race through time, or invent player participation to reach a target.' }
});
const STORYLOOM_CONTROLS = [
  {key:'npc', name:'NPC autonomy', hint:'How independently other characters act', cues:[
    'Let NPCs respond consistently to their current priorities.',
    'Let NPCs pursue small independent priorities alongside the scene.',
    'Balance NPC initiative and the player’s natural opportunity to participate.',
    'Have NPCs pursue independent obligations, tensions, desires, and plans.',
    'Run an active ensemble with intersecting NPC agendas; they act without awaiting player directions.'
  ]},
  {key:'pace', name:'Scene pacing', hint:'Quiet moments ↔ active developments', cues:[
    'Stay very close to the ongoing moment; develop dialogue without skipping ahead.',
    'Favor unhurried interactions with one credible change in the scene.',
    'Let one action cause a response and a natural shift in the current beat.',
    'Advance several causally linked actions without taking the player’s turn.',
    'Make the present scene eventful through plausible consequences, never random twists or forced time jumps.'
  ]},
  {key:'emotion', name:'Emotional intensity', hint:'Understated ↔ messy and intense', cues:[
    'Rely chiefly on restrained choices and subtext.',
    'Keep reactions grounded, with occasional revealing behavior.',
    'Balance emotional weight, humor, and ordinary behavior.',
    'Let powerful feelings alter imperfect dialogue and behavior without explaining them.',
    'Allow messy, contradictory emotions with concrete consequences; avoid melodramatic speeches.'
  ]},
  {key:'prose', name:'Prose density', hint:'Lean ↔ richly textured', cues:[
    'Keep description lean and concrete; allow dialogue to lead.',
    'Write readable paragraphs with a few relevant sensory anchors.',
    'Keep connected paragraphs and varied rhythms.',
    'Write substantial flowing paragraphs; thread dialogue through action and location.',
    'Use immersive connected fiction paragraphs with precise physical blocking; never purple prose or filler.'
  ]},
  {key:'freshness', name:'Avoid repetition', hint:'Gentle ↔ strong anti-loop checks', cues:[
    'Avoid noticeable repetition of language and action.',
    'Vary openings and repeated physical gestures.',
    'Check for recycled rhythms and conversational endings.',
    'Avoid echoes of the past two turns and stock emotional descriptions.',
    'Replace repetitive stock phrases, metaphors, stares, interruptions, and beats with new specific behavior.'
  ]}
];
function storyloomContext() {
  if (typeof SillyTavern === 'undefined' || typeof SillyTavern.getContext !== 'function') throw Error('SillyTavern context unavailable');
  return SillyTavern.getContext();
}
function storyloomSettings() {
  const context = storyloomContext();
  if (!context.extensionSettings[STORYLOOM_NAME] || typeof context.extensionSettings[STORYLOOM_NAME] !== 'object') {
    context.extensionSettings[STORYLOOM_NAME] = {...STORYLOOM_DEFAULTS};
  }
  const s = context.extensionSettings[STORYLOOM_NAME];
  for (const [key, val] of Object.entries(STORYLOOM_DEFAULTS)) {
    if (!Object.prototype.hasOwnProperty.call(s,key)) s[key] = val;
  }
  if(s.mode==='cozy')s.mode='tender'; if(s.mode==='slow')s.mode='yearning'; if(s.mode==='stakes')s.mode='ruin';
  if (!Object.prototype.hasOwnProperty.call(STORYLOOM_MODES,s.mode) && s.mode !== 'custom') s.mode = 'yearning';
  if (!Object.prototype.hasOwnProperty.call(STORYLOOM_LENGTHS,s.length)) s.length = 'novel';
  for (const control of STORYLOOM_CONTROLS) {
    const n = Number(s[control.key]);
    s[control.key] = Number.isFinite(n) ? Math.max(1,Math.min(5,Math.round(n))) : STORYLOOM_DEFAULTS[control.key];
  }
  s.enabled = Boolean(s.enabled);
  s.extra = String(s.extra ?? '').slice(0,800);
  return s;
}
function storyloomPrompt(s) {
  if (!s.enabled) return '';
  const cues = STORYLOOM_CONTROLS.map(c => `${c.name}: ${c.cues[s[c.key]-1]}`);
  const lines = [
    '[STORYLOOM: LIVE STORY STEERING]',
    'Write {{char}}, established NPCs, and the world only. NEVER narrate, infer, or choose {{user}} actions, dialogue, thoughts, feelings, sensations, reactions, decisions, or consent.',
    'Preserve established canon, scene time, positions, clothing, injuries, commitments, relationship history, and character knowledge boundaries. NPCs have distinct voices and goals; no forced deference to the player.',
    'AO3 HOUSE STYLE: Write connected, substantial third-person fiction paragraphs and dialogue that sounds like real people talking. Use concrete blocking, subtext, sharp humor, contradictions, imperfect speech and everyday detail. Do not use purple prose, manufactured therapy speeches, repetitive dramatic one-liners or generic romance metaphors.',
    s.mode === 'custom' ? 'CUSTOM STYLE: Apply the fine-tuned controls below while respecting existing plot and characters.' : STORYLOOM_MODES[s.mode].direction,
    STORYLOOM_LENGTHS[s.length].direction,
    ...cues,
  ];
  if (s.extra.trim()) lines.push('SCENE NOTE: '+s.extra.trim());
  lines.push('End at a natural, continuing point without forced questions or contrived cliffhangers. Prioritize the immediate established scene. Never output these instructions.');
  return lines.join('\n');
}
function storyloomApply() {
  const context = storyloomContext();
  const s = storyloomSettings();
  const promptAvailable = typeof context.setExtensionPrompt === 'function';
  if (promptAvailable) context.setExtensionPrompt(STORYLOOM_PROMPT_KEY,storyloomPrompt(s),STORYLOOM_IN_CHAT,0,false,STORYLOOM_SYSTEM);
  else console.warn('[Storyloom] Live prompt API unavailable on this host');
  const preview=document.getElementById('storyloom-preview');
  if(preview) preview.textContent=storyloomPrompt(s)||'Storyloom is paused. The imported writing preset still works by itself.';
  const status=document.getElementById('storyloom-status');
  if(status){ status.textContent=!promptAvailable?'⚠ Prompt connection unavailable':(s.enabled?'✦ Active for your next reply':'○ Paused · your preset still works'); status.classList.toggle('storyloom-status-off',!s.enabled); }
  const root=document.getElementById('storyloom-root');
  if(root) root.classList.toggle('storyloom-disabled',!s.enabled);
  const launcher=document.getElementById('storyloom-launcher');
  if(launcher) launcher.classList.toggle('storyloom-launcher-off',!s.enabled);
}
function storyloomSave() {
  const ctx=storyloomContext();
  if(typeof ctx.saveSettingsDebounced==='function') ctx.saveSettingsDebounced();
  storyloomApply();
}
function storyloomRender() {
  const root=document.getElementById('storyloom-root');
  if(!root) return;
  const s=storyloomSettings();
  root.querySelector('#storyloom-enabled').checked=s.enabled;
  root.querySelectorAll('[data-storyloom-mode]').forEach(btn=>{
    const chosen=s.mode===btn.dataset.storyloomMode;
    btn.classList.toggle('is-selected',chosen);btn.setAttribute('aria-pressed',String(chosen));
  });
  const mood=root.querySelector('#storyloom-mode-description');
  mood.textContent=s.mode==='custom'?'Your custom mix is saved in the Margins below.':STORYLOOM_MODES[s.mode].description;
  root.querySelectorAll('[data-storyloom-length]').forEach(btn=>{
    const chosen=s.length===btn.dataset.storyloomLength;
    btn.classList.toggle('is-selected',chosen);btn.setAttribute('aria-pressed',String(chosen));
  });
  root.querySelector('#storyloom-length-description').textContent=STORYLOOM_LENGTHS[s.length].label;
  for(const c of STORYLOOM_CONTROLS){
    const range=root.querySelector(`#storyloom-${c.key}`);
    if(range)range.value=s[c.key];
    const output=root.querySelector(`#storyloom-${c.key}-value`);
    if(output)output.textContent=`${s[c.key]}/5`;
  }
  root.querySelector('#storyloom-extra').value=s.extra;
  storyloomApply();
}

const STORYLOOM_PANEL_HTML = "\n<div class=\"storyloom-book-cover\">\n<div class=\"storyloom-cover-line\"></div>\n<div class=\"storyloom-cover-top\">THE WRITER'S EDITION <span>VOL. I</span></div>\n<div aria-hidden=\"true\" class=\"storyloom-cover-illustration\">\n<svg aria-label=\"Decorative roses and vines\" height=\"106\" role=\"img\" viewbox=\"0 0 300 106\" width=\"300\">\n<g fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.25\">\n<path d=\"M19 84 Q70 87 99 47 Q130 10 149 52 Q171 10 201 47 Q228 87 281 84\"></path>\n<path d=\"M75 73 q-28 -28 -36 -22 q3 23 36 22ZM95 51 q-19 -33 -31 -32 q-1 20 31 32ZM224 73 q27 -29 38 -22 q-7 22 -38 22ZM205 51 q17 -34 31 -32 q1 21 -31 32Z\"></path>\n<path d=\"M135 50 c-18 -10 -12 -25 -1 -24 c7 1 12 13 16 20 c5 -17 15 -25 25 -17 c10 13 -8 29 -25 41 c-12 -9 -19 -14 -15 -20Z\"></path>\n<path d=\"M147 46 q-8 -12 1 -15 q11 0 8 16 q-12 15 -19 3 q1 -10 13 -8\"></path>\n<path d=\"M150 70 v22 M139 81 q-9 -10 -19 -7 q4 15 19 7 M160 83 q12 -10 21 -6 q-5 14 -21 6\"></path>\n<path d=\"M109 25l2 -5 2 5 5 2 -5 2 -2 5 -2 -5 -5 -2Z M189 25l2 -5 2 5 5 2 -5 2 -2 5 -2 -5 -5 -2Z\"></path>\n</g>\n</svg>\n</div>\n<div class=\"storyloom-cover-title\">Storyloom</div>\n<div class=\"storyloom-cover-subtitle\">a love letter to your stories</div>\n<div aria-hidden=\"true\" class=\"storyloom-cover-ornament\">✧   ❦   ✧</div>\n<div class=\"storyloom-cover-status\">\n<div><span class=\"storyloom-small-title\">YOUR WRITING DESK</span><span aria-live=\"polite\" class=\"storyloom-status\" id=\"storyloom-status\" role=\"status\">✦ Ready for your next reply</span></div>\n<label aria-label=\"Enable Storyloom\" class=\"storyloom-toggle\">\n<input checked=\"\" id=\"storyloom-enabled\" type=\"checkbox\"/>\n<span class=\"storyloom-toggle-track\"><span class=\"storyloom-toggle-thumb\"></span></span>\n</label>\n</div>\n</div>\n<main class=\"storyloom-paper\">\n<section aria-labelledby=\"storyloom-vibe-heading\" class=\"storyloom-section\">\n<div class=\"storyloom-chapter\"><span class=\"storyloom-chapter-index\">CHAPTER I</span><span aria-hidden=\"true\" class=\"storyloom-ornament\">❧</span></div>\n<h3 id=\"storyloom-vibe-heading\">What kind of story?</h3>\n<p class=\"storyloom-intro\">Choose the mood. The words take care of themselves.</p>\n<div aria-label=\"Story mood\" class=\"storyloom-vibes\" role=\"group\">\n<button aria-pressed=\"false\" class=\"storyloom-vibe\" data-storyloom-mode=\"tender\" type=\"button\"><span aria-hidden=\"true\" class=\"storyloom-vibe-icon\">❀</span><strong>Tender Pages</strong><small>fluff &amp; banter</small></button>\n<button aria-pressed=\"true\" class=\"storyloom-vibe\" data-storyloom-mode=\"yearning\" type=\"button\"><span aria-hidden=\"true\" class=\"storyloom-vibe-icon\">♡</span><strong>Slow Burn</strong><small>yearning &amp; tension</small></button>\n<button aria-pressed=\"false\" class=\"storyloom-vibe\" data-storyloom-mode=\"ruin\" type=\"button\"><span aria-hidden=\"true\" class=\"storyloom-vibe-icon\">✦</span><strong>Beautiful Ruin</strong><small>angst &amp; consequences</small></button>\n</div>\n<p class=\"storyloom-caption\" id=\"storyloom-mode-description\">Slow-burn chemistry and gloriously inconvenient feelings.</p>\n</section>\n<div aria-hidden=\"true\" class=\"storyloom-divider\"><span>✿</span></div>\n<section aria-labelledby=\"storyloom-length-heading\" class=\"storyloom-section\">\n<div class=\"storyloom-chapter\"><span class=\"storyloom-chapter-index\">CHAPTER II</span><span aria-hidden=\"true\" class=\"storyloom-ornament\">❧</span></div>\n<h3 id=\"storyloom-length-heading\">How much should I write?</h3>\n<p class=\"storyloom-intro\">Substantial paragraphs, good dialogue, no padding.</p>\n<div aria-label=\"Response length\" class=\"storyloom-length-options\" role=\"group\">\n<button aria-pressed=\"false\" data-storyloom-length=\"short\" type=\"button\">A Scene</button>\n<button aria-pressed=\"false\" data-storyloom-length=\"detailed\" type=\"button\">A Chapter</button>\n<button aria-pressed=\"true\" data-storyloom-length=\"novel\" type=\"button\">Long Chapter ♡</button>\n</div>\n<p class=\"storyloom-caption\" id=\"storyloom-length-description\">Long chapter: rich AO3-style scene writing, never padded.</p>\n</section>\n<aside class=\"storyloom-covenant\"><span aria-hidden=\"true\" class=\"storyloom-covenant-icon\">♧</span><div><strong>Our little writing pact</strong><p>Your OC belongs to you. NPCs have their own lives. Established details stick. Dialogue sounds human. Romance has to be earned.</p></div></aside>\n<details class=\"storyloom-advanced\" id=\"storyloom-advanced\">\n<summary><span>✎   Notes in the margins <small>(optional)</small></span><span aria-hidden=\"true\" class=\"storyloom-chevron\">⌄</span></summary>\n<div class=\"storyloom-advanced-inner\">\n<p class=\"storyloom-caption\">For days you want to fine-tune. You never need to touch these to use Storyloom.</p>\n<div id=\"storyloom-sliders\"></div>\n<label class=\"storyloom-input-label\" for=\"storyloom-extra\">A note for this chapter <small>(optional)</small></label>\n<textarea id=\"storyloom-extra\" maxlength=\"800\" placeholder=\"Example: More sarcastic banter, fewer emotional explanations.\" rows=\"3\"></textarea>\n<div class=\"storyloom-actions\"><button id=\"storyloom-reset\" type=\"button\">Restore defaults</button><button id=\"storyloom-copy\" type=\"button\">Copy prompt</button></div>\n<details class=\"storyloom-technical\"><summary>Curious? See the prompt instructions</summary><pre id=\"storyloom-preview\"></pre></details>\n</div>\n</details>\n<footer class=\"storyloom-footer\"><span aria-hidden=\"true\">❦</span><p>Changes apply on your next reply.<br/>Made for stories worth staying up for.</p><span aria-hidden=\"true\">❦</span></footer>\n</main>\n";
let storyloomPreviousFocus = null;
function storyloomOpen() {
  const overlay=document.getElementById('storyloom-backdrop');
  if (!overlay) return;
  storyloomPreviousFocus=document.activeElement;
  overlay.hidden=false;
  document.getElementById('storyloom-launcher')?.setAttribute('aria-expanded','true');
  document.getElementById('storyloom-close')?.focus();
}
function storyloomClose() {
  const overlay=document.getElementById('storyloom-backdrop');
  if (!overlay) return;
  overlay.hidden=true;
  document.getElementById('storyloom-launcher')?.setAttribute('aria-expanded','false');
  if (storyloomPreviousFocus && document.contains(storyloomPreviousFocus)) storyloomPreviousFocus.focus();
}
function storyloomInit() {
  if (document.getElementById('storyloom-launcher')) return;
  const launcher=document.createElement('button');
  launcher.type='button'; launcher.id='storyloom-launcher';
  launcher.title='Open Storyloom · The Romance Library';
  launcher.setAttribute('aria-label','Open Storyloom Romance Library');
  launcher.setAttribute('aria-expanded','false');
  launcher.setAttribute('aria-controls','storyloom-backdrop');
  launcher.innerHTML='<span aria-hidden="true" class="storyloom-launcher-rose">❦</span><span class="storyloom-launcher-label">Storyloom</span>';
  const overlay=document.createElement('div');
  overlay.id='storyloom-backdrop'; overlay.className='storyloom-backdrop'; overlay.hidden=true;
  const root=document.createElement('div'); root.id='storyloom-root';
  root.className='storyloom-dialog'; root.setAttribute('role','dialog');
  root.setAttribute('aria-modal','true'); root.setAttribute('aria-label','Storyloom · The Romance Library');
  const close=document.createElement('button'); close.type='button'; close.id='storyloom-close';
  close.textContent='×'; close.title='Close Storyloom'; close.setAttribute('aria-label','Close Storyloom');
  root.append(close);
  const panel=document.createElement('div'); panel.className='storyloom-panel'; panel.innerHTML=STORYLOOM_PANEL_HTML;
  root.append(panel); overlay.append(root); document.body.append(launcher,overlay);
  launcher.addEventListener('click',storyloomOpen);
  close.addEventListener('click',storyloomClose);
  overlay.addEventListener('click',(e)=>{ if(e.target===overlay)storyloomClose(); });
  document.addEventListener('keydown',(e)=>{ if(!overlay.hidden && e.key==='Escape') storyloomClose(); });
  const sliders=root.querySelector('#storyloom-sliders');
  for (const c of STORYLOOM_CONTROLS) {
    const wrapper=document.createElement('div');wrapper.className='storyloom-control';
    const head=document.createElement('div');head.className='storyloom-control-head';
    const name=document.createElement('label');name.textContent=c.name;name.htmlFor=`storyloom-${c.key}`;
    const value=document.createElement('output');value.id=`storyloom-${c.key}-value`;
    head.append(name,value);
    const slider=document.createElement('input');slider.type='range';slider.id=`storyloom-${c.key}`;slider.min=1;slider.max=5;slider.step=1;
    slider.setAttribute('aria-label',c.name);
    const hint=document.createElement('small');hint.textContent=c.hint;
    slider.addEventListener('input',()=>{
      const s=storyloomSettings();s[c.key]=Number(slider.value);s.mode='custom';storyloomSave();storyloomRender();
    });
    wrapper.append(head,slider,hint);sliders.append(wrapper);
  }
  root.querySelector('#storyloom-enabled').addEventListener('change',e=>{
    storyloomSettings().enabled=e.target.checked;storyloomSave();storyloomRender();
  });
  root.querySelectorAll('[data-storyloom-mode]').forEach(btn=>btn.addEventListener('click',()=>{
    const s=storyloomSettings();const mode=btn.dataset.storyloomMode;
    s.mode=mode;
    for(const c of STORYLOOM_CONTROLS)s[c.key]=STORYLOOM_MODES[mode][c.key];
    storyloomSave();storyloomRender();
  }));
  root.querySelectorAll('[data-storyloom-length]').forEach(btn=>btn.addEventListener('click',()=>{
    storyloomSettings().length=btn.dataset.storyloomLength;storyloomSave();storyloomRender();
  }));
  root.querySelector('#storyloom-extra').addEventListener('input',e=>{
    storyloomSettings().extra=e.target.value.slice(0,800);storyloomSave();
  });
  root.querySelector('#storyloom-reset').addEventListener('click',()=>{
    Object.assign(storyloomSettings(),{...STORYLOOM_DEFAULTS});storyloomSave();storyloomRender();
  });
  root.querySelector('#storyloom-copy').addEventListener('click',async()=>{
    try{
      await navigator.clipboard.writeText(storyloomPrompt(storyloomSettings()));
      root.querySelector('#storyloom-status').textContent='✓ Prompt copied';
    } catch(e){
      root.querySelector('#storyloom-status').textContent='Copy unavailable: select text from prompt preview';
      root.querySelector('.storyloom-technical').open=true;
    }
  });
  storyloomRender();
  console.info('[Storyloom] v0.4 loaded with standalone launcher');
}
function storyloomBoot() {
  try { storyloomInit(); }
  catch(e) {console.error('[Storyloom] Startup error:',e); }
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',storyloomBoot,{once:true});
else storyloomBoot();
