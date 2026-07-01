var models = [
{id:'m1',name:'Zayna',age:24,city:'Dubai',country:'UAE',lbs:'Dubai Marina',online:true,chats:18,revenue:'$42.5',pending:3,avatar:'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',bio:'Warm, playful, loves coffee and late-night chats.',tags:['Sweet','Dubai','Warm Chat'],persona:'Gentle, playful, short replies. Avoid direct offline promises.',voice:'Soft, caring, light emoji.'},
{id:'m2',name:'Lina',age:26,city:'Riyadh',country:'SA',lbs:'Riyadh Center',online:true,chats:11,revenue:'$36.0',pending:2,avatar:'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',bio:'Mature and calm. Likes music, travel, and quiet calls.',tags:['Mature','Riyadh','VIP Care'],persona:'Calm, caring, low emoji usage, suitable for VIP care.',voice:'Mature, steady, premium.'},
{id:'m3',name:'Noor',age:23,city:'Doha',country:'QA',lbs:'Doha West Bay',online:false,chats:5,revenue:'$18.5',pending:1,avatar:'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',bio:'Shy but responsive. Best for ice breaking.',tags:['Shy','Doha','New Match'],persona:'Short warm answers, ask light questions, avoid hard selling.',voice:'Shy, simple, gentle.'},
{id:'m4',name:'Maya',age:25,city:'Kuwait City',country:'KW',lbs:'Salmiya',online:true,chats:9,revenue:'$31.0',pending:2,avatar:'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=200&q=80',bio:'Confident, stylish, good at private content conversion.',tags:['Confident','Kuwait','Private'],persona:'Confident and warm, suitable for private moment after warm chat.',voice:'Confident, direct, warm.'}
];
var males = [
{id:'u1',name:'Ahmed',age:31,country:'Saudi Arabia',distance:'4.8 km',payment:'Free',freeLeft:1,spend:'$0',intent:'High Intent',stage:'Warm Chat',avatar:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80'},
{id:'u2',name:'Omar',age:34,country:'UAE',distance:'2.1 km',payment:'VIP',freeLeft:'∞',spend:'$89',intent:'VIP Care',stage:'VIP Care',avatar:'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=160&q=80'},
{id:'u3',name:'Fahad',age:29,country:'Qatar',distance:'7.6 km',payment:'Paid',freeLeft:'∞',spend:'$24',intent:'High Intent',stage:'Private Unlocked',avatar:'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80'},
{id:'u4',name:'Khalid',age:27,country:'Kuwait',distance:'12.4 km',payment:'Free',freeLeft:3,spend:'$0',intent:'Medium Intent',stage:'New Match',avatar:'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80'},
{id:'u5',name:'Yousef',age:32,country:'Bahrain',distance:'5.3 km',payment:'Free',freeLeft:0,spend:'$0',intent:'Paywall Near',stage:'Paywall Near',avatar:'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=160&q=80'},
{id:'u6',name:'Nasser',age:30,country:'Oman',distance:'3.9 km',payment:'VIP',freeLeft:'∞',spend:'$56',intent:'VIP Care',stage:'VIP Care',avatar:'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?auto=format&fit=crop&w=160&q=80'},
{id:'u7',name:'Rashid',age:28,country:'UAE',distance:'6.2 km',payment:'Free',freeLeft:2,spend:'$0',intent:'Medium Intent',stage:'New Match',avatar:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80'},
{id:'u8',name:'Sultan',age:36,country:'KSA',distance:'8.4 km',payment:'VIP',freeLeft:'∞',spend:'$112',intent:'VIP Care',stage:'VIP Care',avatar:'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80'},
{id:'u9',name:'Majed',age:33,country:'Qatar',distance:'4.1 km',payment:'Free',freeLeft:1,spend:'$0',intent:'High Intent',stage:'Warm Chat',avatar:'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&w=160&q=80'},
{id:'u10',name:'Tariq',age:29,country:'Kuwait',distance:'9.8 km',payment:'VIP',freeLeft:'∞',spend:'$74',intent:'Call Intent',stage:'Call History',avatar:'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=160&q=80'},
{id:'u11',name:'Hamad',age:26,country:'Oman',distance:'6.7 km',payment:'Free',freeLeft:2,spend:'$0',intent:'Medium Intent',stage:'New Match',avatar:'https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=160&q=80'},
{id:'u12',name:'Salem',age:31,country:'UAE',distance:'11.2 km',payment:'Free',freeLeft:1,spend:'$0',intent:'Warm Chat',stage:'Warm Chat',avatar:'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=160&q=80'},
{id:'u13',name:'Adel',age:35,country:'Bahrain',distance:'3.3 km',payment:'Paid',freeLeft:'∞',spend:'$38',intent:'High Intent',stage:'Private Unlocked',avatar:'https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=160&q=80'},
{id:'u14',name:'Bader',age:30,country:'Saudi Arabia',distance:'5.9 km',payment:'Free',freeLeft:0,spend:'$0',intent:'Paywall Near',stage:'Paywall Near',avatar:'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=160&q=80'}
];
var conversations = [
{id:'c1',male:'u1',model:'m1',last:'Are you online now? I wanted to ask something...',wait:'4m',action:'Send a private moment',status:'Free',timeout:false,unread:2},
{id:'c2',male:'u2',model:'m2',last:'Can we talk again tonight?',wait:'1m',action:'Invite him to a quick call',status:'VIP',timeout:false,unread:1},
{id:'c3',male:'u3',model:'m4',last:'That photo was nice. Do you have another one?',wait:'9m',action:'Send private content',status:'Paid',timeout:false,unread:1},
{id:'c4',male:'u4',model:'m3',last:'Hi, nice to meet you here',wait:'18m',action:'Reply quickly',status:'Free',timeout:true,unread:0},
{id:'c5',male:'u5',model:'m1',last:'Why can’t I send more messages?',wait:'2m',action:'Keep the conversation going',status:'Free',timeout:false,unread:3},
{id:'c6',male:'u6',model:'m1',last:'I liked your coffee photo. Are you around?',wait:'6m',action:'Invite to a soft call',status:'VIP',timeout:false,unread:1},
{id:'c7',male:'u7',model:'m1',last:'Hi Zayna, nice to match with you.',wait:'12m',action:'Send a warm reply',status:'Free',timeout:false,unread:0},
{id:'c8',male:'u8',model:'m2',last:'I am free tonight if Lina is around.',wait:'5m',action:'Send VIP check-in',status:'VIP',timeout:false,unread:2},
{id:'c9',male:'u9',model:'m2',last:'I want to hear more about your travel story.',wait:'11m',action:'Send warm follow-up',status:'Free',timeout:false,unread:1},
{id:'c10',male:'u10',model:'m2',last:'Can we do a short call later?',wait:'15m',action:'Invite to call',status:'VIP',timeout:false,unread:0},
{id:'c11',male:'u11',model:'m3',last:'Hi Noor, nice to meet you here.',wait:'3m',action:'Send icebreaker',status:'Free',timeout:false,unread:1},
{id:'c12',male:'u12',model:'m3',last:'Your profile feels calm. Are you shy?',wait:'7m',action:'Reply softly',status:'Free',timeout:false,unread:0},
{id:'c13',male:'u13',model:'m4',last:'That private photo was worth it.',wait:'8m',action:'Send private follow-up',status:'Paid',timeout:false,unread:2},
{id:'c14',male:'u14',model:'m4',last:'I am out of free messages now.',wait:'13m',action:'Push unlock reply',status:'Free',timeout:false,unread:1}
];
var leads = [
{id:'l1',male:'u1',model:'m1',reason:'Viewed Zayna twice · returned within 10 min',intent:'High Intent',active:'Online now',action:'Send Greeting',stage:'Viewed Model'},
{id:'l2',male:'u5',model:'m1',reason:'Reached free-message limit · still active',intent:'Paywall Near',active:'2m ago',action:'Keep Conversation Going',stage:'Paywall Near'},
{id:'l3',male:'u2',model:'m2',reason:'VIP user called Lina before',intent:'VIP Care',active:'Online now',action:'Invite to Call',stage:'Call History'},
{id:'l4',male:'u4',model:'m3',reason:'Matched Noor but has not started chat',intent:'Medium Intent',active:'18m ago',action:'Send Icebreaker',stage:'Matched No Chat'},
{id:'l5',male:'u3',model:'m4',reason:'Unlocked private content with similar model',intent:'High Intent',active:'9m ago',action:'Send Public Photo',stage:'High Intent'}
];
var assets = [
{id:'a1',model:'m1',type:'Public Photo',price:'Free',sent:false,scenario:'Ice breaking',thumb:'https://images.unsplash.com/photo-1512316609839-ce289d3eba0a?auto=format&fit=crop&w=240&q=80',title:'Coffee selfie'},
{id:'a2',model:'m1',type:'Private Photo',price:'99 coins',sent:true,scenario:'Warm Chat',thumb:'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=240&q=80',title:'Private moment'},
{id:'a6',model:'m1',type:'Private Photo',price:'109 coins',sent:false,scenario:'Warm Chat',thumb:'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=240&q=80',title:'Soft evening photo'},
{id:'a7',model:'m1',type:'Private Video',price:'179 coins',sent:false,scenario:'Paywall Near',thumb:'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=240&q=80',title:'Good night clip'},
{id:'a3',model:'m2',type:'Private Video',price:'199 coins',sent:false,scenario:'VIP Care',thumb:'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=240&q=80',title:'Short hello video'},
{id:'a8',model:'m2',type:'Private Photo',price:'129 coins',sent:false,scenario:'VIP Care',thumb:'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=240&q=80',title:'Premium portrait'},
{id:'a9',model:'m2',type:'Private Photo',price:'139 coins',sent:false,scenario:'Call History',thumb:'https://images.unsplash.com/photo-1496440737103-cd596325d314?auto=format&fit=crop&w=240&q=80',title:'Travel look'},
{id:'a4',model:'m3',type:'Script',price:'Free',sent:false,scenario:'New Match',thumb:'',title:'Nice to meet you here 😊'},
{id:'a10',model:'m3',type:'Private Photo',price:'89 coins',sent:false,scenario:'New Match',thumb:'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',title:'Shy smile'},
{id:'a11',model:'m3',type:'Private Video',price:'159 coins',sent:false,scenario:'Warm Chat',thumb:'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=240&q=80',title:'Soft hello video'},
{id:'a5',model:'m4',type:'Private Photo',price:'129 coins',sent:false,scenario:'Private Unlocked',thumb:'https://images.unsplash.com/photo-1524503033411-c9566986fc8f?auto=format&fit=crop&w=240&q=80',title:'Evening look'}
,{id:'a12',model:'m4',type:'Private Photo',price:'119 coins',sent:false,scenario:'High Intent',thumb:'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=240&q=80',title:'Confident selfie'}
,{id:'a13',model:'m4',type:'Private Video',price:'189 coins',sent:false,scenario:'Private Unlocked',thumb:'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?auto=format&fit=crop&w=240&q=80',title:'Private return clip'}
];
var gifts = [
{id:'g1',icon:'🌹',name:'Rose',price:20,tone:'Soft opener'},
{id:'g2',icon:'☕',name:'Coffee',price:30,tone:'Warm chat'},
{id:'g3',icon:'💎',name:'Diamond',price:88,tone:'High intent'},
{id:'g4',icon:'🎁',name:'Surprise',price:99,tone:'Private lead-in'},
{id:'g5',icon:'👑',name:'Crown',price:188,tone:'VIP care'},
{id:'g6',icon:'💫',name:'Starlight',price:66,tone:'Sweet reply'}
];
var annotations = {
login:{purpose:'Simulate staff login and enter the supply-side workbench.',chips:['login','Staff'],rules:['No male-side swipe features.','Female side waits for inbound male messages.','After login, enter Inbox.']},
inbox:{purpose:'Global or model-specific conversation workbench. Helps the chatter switch between Active Chats and Leads, then decide who to reply to or naturally touch next.',chips:['inbox','currentModel','Aggregation'],rules:['All mode aggregates active chats and leads across models.','Single model mode isolates that model’s IM list.','Conversation cards must show Male User + owning Model + stage + intent.']},
chat_detail:{purpose:'Reply to one male user using the conversation-bound model identity.',chips:['chat_detail','Bound Model','IM'],rules:['Chat Detail is bound to Conversation = Male User + Model + Staff.','Do not mix other model assets or scripts.','Private and call actions must be natural conversion tools.']},
models:{purpose:'Switch model identity and view backend-configured model summaries.',chips:['models','Switch Identity'],rules:['Switch Identity updates global currentModel.','Model-specific profile, assets, and IM list must not mix.','Model info is read-only in MVP.']},
model_detail:{purpose:'Review one model’s profile, persona, LBS, content pack, and conversation entry.',chips:['model_detail','Persona','LBS'],rules:['Profile, photos, private content, LBS, and voice style are backend-configured.','Operator can view, not edit.','Switching identity affects Inbox and Assets.']},
assets:{purpose:'Show the model-scoped IM list from the bottom tab. Operators can switch model identity at the top and enter the matching chat detail.',chips:['assets','IM list','Model switch'],rules:['Top model switch filters IM conversations by currentModel.','Single model view only shows that model’s active IM list.','Private photos and videos are not shown on this first-level page.']},
content_picker:{purpose:'Confirm selected model-owned asset before sending in the current conversation.',chips:['content_picker','Send Preview'],rules:['Show current conversation context.','Warn if already sent.','After sending, return to Chat Detail and insert PrivateUnlockCard.']},
emoji_picker:{purpose:'Pick and send a light emoji sticker in the current chat.',chips:['emoji_picker','Composer'],rules:['Emoji picker opens from Chat Detail composer.','Selected emoji is sent directly into the conversation.','Close returns to Chat Detail without changing conversation binding.']},
gift_picker:{purpose:'Select and send a lightweight virtual gift in the current chat.',chips:['gift_picker','Gift Panel'],rules:['Gift panel opens from Chat Detail composer.','Selected gift is sent under the bound conversation model.','After sending, return to Chat Detail and insert a gift card.']},
me:{purpose:'Show Staff work status and current operating identity.',chips:['me','Staff'],rules:['Me is Staff-level, not Model-level.','Online status must sync with Work Status.','Current identity should be visible.']},
work_status:{purpose:'Lightweight online/offline control for MVP.',chips:['work_status'],rules:['No full shift system in MVP.','Offline stops new assignment but historical conversations remain visible.']},
income_detail:{purpose:'Show diamond income history — chat rewards, gifts, private unlocks, and call bonuses.',chips:['income_detail','Diamond'],rules:['Diamond income is read-only for MVP.','Each row shows source, amount, and timestamp.','Back returns to Me.']},
ratio_detail:{purpose:'Show detailed performance breakdown for Unlock, Payment, Activity, and Response.',chips:['ratio_detail','Performance'],rules:['Ratio Detail is a sub-page of Me.','Each metric shows percentage, progress bar, and sub-stats.','Date filter switches between daily snapshots.','Back returns to Me.']}
};
