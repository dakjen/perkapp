import { useState, useEffect } from "react";
import { Building2, User, CreditCard, Lock, CheckCircle, RefreshCw, FileText, Lightbulb, Info, AlertTriangle, Sparkles, Leaf, Award, Star, Trophy, Upload, ChevronRight, DollarSign, Shield, Laptop, Coffee, Heart, Globe, Clock, BookOpen, Dumbbell, Shirt, Home, Plane, Palette, Baby, Handshake, Bell, Activity, TrendingUp, Wallet, Gift } from "lucide-react";

const C = {
  bg:"#F5F2EC", surface:"#EDEAE0", card:"#FFFFFF", border:"#DDD9CE",
  accent:"#5C6B2E", accentDark:"#3D4A1A", accentLight:"#7A9142", accentBg:"#EBF0DC",
  text:"#1E2012", muted:"#7A7860", danger:"#C0392B", warning:"#C98A3A",
  success:"#4A7C3F", blue:"#3A5F9E", white:"#FFFFFF",
  gold:"#B8972A", pop:"#D4622A", popBg:"#FDF0EA",
};

const ALL_CATEGORIES = ["Wellness","Mental Health","Fitness","Professional Dev","Meals","Travel","Home Office","Childcare"];

const SEED = [
  {
    id:"c1", name:"Studio Nova", plan:"Growth",
    adminEmail:"admin@studionova.com", adminPass:"admin123",
    logo:null, brandColor:"#5C6B2E", accountBalance:1200, perks:[],
    members:[
      {id:"u1",name:"Jamie Lee",email:"jamie@studionova.com",pass:"jamie123",type:"W-2",stipend:150,frequency:"monthly",categories:["Wellness","Mental Health","Fitness"],balance:150,cardLimit:150},
      {id:"u2",name:"Morgan Blake",email:"morgan@studionova.com",pass:"morgan123",type:"1099",stipend:100,frequency:"monthly",categories:["Professional Dev","Wellness"],balance:60,cardLimit:100},
      {id:"u3",name:"Riley Chen",email:"riley@studionova.com",pass:"riley123",type:"W-2",stipend:200,frequency:"quarterly",categories:["Wellness","Fitness","Mental Health","Meals"],balance:200,cardLimit:200},
    ],
    transactions:[
      {id:"t1",userId:"u1",name:"Jamie Lee",amount:45,merchant:"Headspace",category:"Mental Health",date:"2025-03-01",status:"approved",note:""},
      {id:"t2",userId:"u1",name:"Jamie Lee",amount:32,merchant:"Equinox",category:"Fitness",date:"2025-03-05",status:"approved",note:""},
      {id:"t3",userId:"u2",name:"Morgan Blake",amount:89,merchant:"Coursera",category:"Professional Dev",date:"2025-03-08",status:"pending",note:""},
      {id:"t4",userId:"u3",name:"Riley Chen",amount:120,merchant:"ClassPass",category:"Fitness",date:"2025-03-10",status:"pending",note:""},
      {id:"t5",userId:"u1",name:"Jamie Lee",amount:55,merchant:"Whole Foods",category:"Meals",date:"2025-03-12",status:"rejected",note:"Meals not in your approved categories"},
      {id:"t6",userId:"u2",name:"Morgan Blake",amount:40,merchant:"Calm App",category:"Mental Health",date:"2025-02-20",status:"approved",note:""},
    ],
  },
  {
    id:"c2", name:"Apex Consulting", plan:"Starter",
    adminEmail:"admin@apex.com", adminPass:"apex123",
    logo:null, brandColor:"#3D4A1A", accountBalance:400, perks:[],
    members:[
      {id:"u4",name:"Sam Torres",email:"sam@apex.com",pass:"sam123",type:"W-2",stipend:200,frequency:"monthly",categories:["Wellness","Mental Health","Fitness","Meals"],balance:140,cardLimit:200},
      {id:"u5",name:"Alex Kim",email:"alex@apex.com",pass:"alex123",type:"1099",stipend:75,frequency:"monthly",categories:["Professional Dev","Wellness"],balance:75,cardLimit:75},
    ],
    transactions:[
      {id:"t7",userId:"u4",name:"Sam Torres",amount:60,merchant:"SoulCycle",category:"Fitness",date:"2025-03-03",status:"approved",note:""},
      {id:"t8",userId:"u5",name:"Alex Kim",amount:29,merchant:"LinkedIn Learning",category:"Professional Dev",date:"2025-03-09",status:"pending",note:""},
    ],
  },
];

const BASE_FEE = 19;
const PER_PERSON_FEE = 5;
const calcPrice = (n) => BASE_FEE + Math.max(0, n - 3) * PER_PERSON_FEE;

const TIERS = [
  {min:0,    max:999,      discount:0,  label:"Standard", TierIcon:Leaf},
  {min:1000, max:4999,     discount:10, label:"Bronze",   TierIcon:Award},
  {min:5000, max:9999,     discount:20, label:"Silver",   TierIcon:Star},
  {min:10000,max:Infinity, discount:30, label:"Gold",     TierIcon:Trophy},
];
const getTier = (b) => [...TIERS].reverse().find(t=>b>=t.min) || TIERS[0];

const PERK_ICONS = [
  {id:"activity", Icon:Activity,  label:"Health"},
  {id:"globe",    Icon:Globe,     label:"Travel"},
  {id:"clock",    Icon:Clock,     label:"Time"},
  {id:"shirt",    Icon:Shirt,     label:"Dress"},
  {id:"home",     Icon:Home,      label:"Remote"},
  {id:"book",     Icon:BookOpen,  label:"Learning"},
  {id:"dumbbell", Icon:Dumbbell,  label:"Fitness"},
  {id:"heart",    Icon:Heart,     label:"Wellness"},
  {id:"plane",    Icon:Plane,     label:"Abroad"},
  {id:"palette",  Icon:Palette,   label:"Creative"},
  {id:"baby",     Icon:Baby,      label:"Family"},
  {id:"laptop",   Icon:Laptop,    label:"Tech"},
  {id:"shield",   Icon:Shield,    label:"Benefits"},
  {id:"dollar",   Icon:DollarSign,label:"Finance"},
  {id:"bell",     Icon:Bell,      label:"Perks"},
  {id:"star",     Icon:Star,      label:"Rewards"},
  {id:"check",    Icon:CheckCircle,label:"Policy"},
  {id:"handshake",Icon:Handshake, label:"Culture"},
  {id:"coffee",   Icon:Coffee,    label:"Office"},
  {id:"wallet",   Icon:Wallet,    label:"Stipend"},
];

const PERK_NOTIFICATIONS = [
  {id:"n1",type:"info",   date:"Mar 28",title:"Stipends reset April 1",    body:"Monthly stipends for all active members will reset on April 1st. Make sure your balance is funded."},
  {id:"n2",type:"tip",    date:"Mar 25",title:"You're close to Bronze tier",body:"Add just $800 more to your balance to unlock 10% off your monthly subscription automatically."},
  {id:"n3",type:"feature",date:"Mar 20",title:"New: Quarterly stipends",   body:"You can now set individual team members to quarterly instead of monthly reset cycles. Try it in the Team tab."},
  {id:"n4",type:"info",   date:"Mar 15",title:"Tax season reminder",       body:"Year-end benefit summaries are ready in the Reports tab. Share per-member totals with your accountant before April 15."},
];

const NOTIF_ICONS = {info:Info, tip:Lightbulb, feature:Sparkles, warning:AlertTriangle};

const TAXABLE_EXAMPLES = [
  [Activity,  "Massage / spa memberships (e.g. ClassPass)"],
  [Heart,     "Therapy app subscriptions (e.g. Headspace, Talkspace)"],
  [Dumbbell,  "Gym memberships not at your workplace"],
  [Coffee,    "Meal delivery or food stipends"],
  [Plane,     "Personal travel allowances"],
  [DollarSign,"Gift cards or cash equivalents"],
  [Shirt,     "Clothing allowances (non-uniform)"],
];

const NONTAXABLE_EXAMPLES = [
  [Shield,    "Employer-sponsored health, dental & vision insurance"],
  [TrendingUp,"Commuter benefits up to $315/mo (transit/parking)"],
  [Baby,      "Dependent care assistance up to $5,000/yr"],
  [BookOpen,  "Job-related education assistance up to $5,250/yr"],
  [Laptop,    "Work-required equipment (laptop, phone, tools)"],
  [Coffee,    "Occasional in-office meals & snacks (de minimis)"],
  [Activity,  "On-site medical / wellness clinic access"],
];

const HOW_STEPS = [
  {StepIcon:Wallet,      title:"Fund your account",           body:"Pre-load your perk. wallet via bank transfer. Funds are held securely and only spent when your team uses their cards."},
  {StepIcon:CreditCard,  title:"Cards are issued automatically",body:"Each team member gets a virtual Visa card the moment you add them. Their spending limit is set to their stipend amount."},
  {StepIcon:Lock,        title:"Cards are category-locked",   body:"Cards are restricted to your approved categories at the merchant level — they simply decline elsewhere. No manual policing needed."},
  {StepIcon:CheckCircle, title:"You approve edge cases",      body:"Ambiguous merchants get flagged for your review. Approve or reject with a note, right from the app."},
  {StepIcon:RefreshCw,   title:"Stipends reset automatically", body:"On the cycle date, each card tops back up to its stipend amount. Monthly or quarterly, your call per person."},
  {StepIcon:FileText,    title:"Year-end is handled",         body:"perk. tracks every approved transaction. At year end, download a tax summary per person — hand it straight to your accountant."},
];

const fmt = n => `$${Number(n).toFixed(2)}`;
const initials = n => n.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2);
const getPerkIcon = (iconId) => PERK_ICONS.find(p=>p.id===iconId)?.Icon || Heart;

// ── Shared UI ──────────────────────────────────────────────────────────────
function StatusBar(){
  const t = new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
  return (
    <div style={{height:44,background:C.bg,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 28px",flexShrink:0}}>
      <span style={{fontSize:13,fontWeight:700,color:C.text}}>{t}</span>
      <div style={{display:"flex",gap:6,alignItems:"center"}}>
        <span style={{fontSize:11,color:C.muted}}>WiFi</span>
        <span style={{fontSize:11,color:C.muted}}>100%</span>
      </div>
    </div>
  );
}

function Avatar({name,size=36,color}){
  const bc=color||C.accent;
  return <div style={{width:size,height:size,borderRadius:"50%",background:`${bc}20`,border:`2px solid ${bc}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.33,fontWeight:800,color:bc,flexShrink:0}}>{initials(name)}</div>;
}

function Badge({status}){
  const m={approved:[C.success,"#D4EDDA"],pending:[C.warning,"#FEF3DC"],rejected:[C.danger,"#FDECEA"]};
  const [c,bg]=m[status]||[C.muted,C.card];
  return <span style={{fontSize:10,fontWeight:700,color:c,background:bg,padding:"3px 9px",borderRadius:20,letterSpacing:"0.04em",textTransform:"uppercase"}}>{status}</span>;
}

function Card({children,onClick,style}){
  return <div onClick={onClick} style={{background:C.card,borderRadius:16,border:`1px solid ${C.border}`,padding:16,marginBottom:12,cursor:onClick?"pointer":"default",boxShadow:"0 1px 4px rgba(0,0,0,0.06)",...style}}>{children}</div>;
}

function Btn({children,onClick,variant="primary",style,disabled}){
  const v={
    primary:{background:C.accentLight,color:"#1E2012",border:"none"},
    secondary:{background:"transparent",color:C.accentLight,border:`1.5px solid ${C.accentLight}`},
    danger:{background:C.danger,color:C.white,border:"none"},
    ghost:{background:C.surface,color:C.text,border:`1px solid ${C.border}`},
  };
  return <button onClick={onClick} disabled={disabled} style={{...v[variant],borderRadius:12,padding:"13px 20px",fontSize:15,fontWeight:700,cursor:disabled?"not-allowed":"pointer",opacity:disabled?0.5:1,width:"100%",letterSpacing:"0.01em",...style}}>{children}</button>;
}

function Field({label,value,onChange,type="text",placeholder}){
  return (
    <div style={{marginBottom:14}}>
      {label&&<div style={{fontSize:11,color:C.muted,marginBottom:6,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase"}}>{label}</div>}
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"13px 14px",color:C.text,fontSize:15,outline:"none",boxSizing:"border-box"}} />
    </div>
  );
}

function Bar({value,max,color}){
  const p=Math.min((value/max)*100,100);
  return <div style={{background:C.surface,borderRadius:100,height:6,overflow:"hidden",marginTop:8}}><div style={{width:`${p}%`,height:"100%",background:color||C.accent,borderRadius:100,transition:"width 0.4s"}}/></div>;
}

function SLabel({children}){
  return <div style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:12,marginTop:4}}>{children}</div>;
}

function BackHeader({title,onBack}){
  return (
    <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12,background:C.bg,flexShrink:0}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:C.muted,fontSize:22,cursor:"pointer",padding:0}}>←</button>
      <div style={{fontSize:17,fontWeight:800,color:C.text}}>{title}</div>
    </div>
  );
}

// ── LOGIN ──────────────────────────────────────────────────────────────────
function Login({onLogin,onCreateCompany}){
  const [role,setRole]=useState(null);
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [err,setErr]=useState("");
  const [loading,setLoading]=useState(false);
  const reset=()=>{setRole(null);setEmail("");setPass("");setErr("");};
  const go=async()=>{
    setErr("");setLoading(true);
    try{
      const res=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password:pass,role})});
      const data=await res.json();
      if(!res.ok){setErr(data.error||"Login failed");setLoading(false);return;}
      if(role==="admin") onLogin("admin",null,data.company.id);
      else onLogin("employee",data.memberId,data.companyId);
    }catch(e){setErr("Something went wrong");setLoading(false);}
  };

  if(!role) return (
    <div style={{flex:1,padding:"40px 24px",display:"flex",flexDirection:"column",justifyContent:"center"}}>
      <div style={{marginBottom:48,textAlign:"center"}}>
        <div style={{fontSize:40,fontWeight:900,color:C.pop,letterSpacing:"0px",marginBottom:8,fontFamily:"'Playfair Display',serif",fontStyle:"italic"}}>perk.</div>
        <div style={{fontSize:15,color:C.muted}}>Benefits for every team.</div>
      </div>
      <div style={{fontSize:13,color:C.muted,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",textAlign:"center",marginBottom:20}}>Sign in as...</div>
      <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:32}}>
        {[{role:"admin",Icon:Building2,title:"Company Admin",sub:"Manage benefits, approve spending, view reports"},
          {role:"employee",Icon:User,title:"Team Member",sub:"View your balance, card, and history"}].map(({role:r,Icon,title,sub})=>(
          <div key={r} onClick={()=>setRole(r)} style={{background:C.card,border:`1.5px solid ${C.border}`,borderRadius:20,padding:"22px 20px",cursor:"pointer",display:"flex",alignItems:"center",gap:16}}>
            <div style={{width:48,height:48,borderRadius:14,background:C.accentBg,border:`2px solid ${C.accent}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Icon size={22} color={C.accent}/></div>
            <div><div style={{fontWeight:800,color:C.text,fontSize:17}}>{title}</div><div style={{fontSize:13,color:C.muted,marginTop:3}}>{sub}</div></div>
            <ChevronRight size={20} color={C.muted} style={{marginLeft:"auto"}}/>
          </div>
        ))}
      </div>
      <div style={{borderTop:`1px solid ${C.border}`,paddingTop:24,textAlign:"center"}}>
        <button onClick={onCreateCompany} style={{background:"none",border:"none",color:C.accent,fontSize:14,fontWeight:700,cursor:"pointer",textDecoration:"underline"}}>Set up a new company</button>
        <div style={{marginTop:10,fontSize:12,color:C.muted}}>perk. · $19/mo + $5 per person</div>
      </div>
    </div>
  );

  return (
    <div style={{flex:1,padding:"32px 24px",display:"flex",flexDirection:"column",justifyContent:"center"}}>
      <button onClick={reset} style={{background:"none",border:"none",color:C.muted,fontSize:14,cursor:"pointer",marginBottom:32,padding:0,textAlign:"left"}}>← Back</button>
      <div style={{marginBottom:32}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:8,background:C.accentBg,border:`1px solid ${C.accent}`,borderRadius:20,padding:"6px 14px",marginBottom:16}}>
          {role==="admin"?<Building2 size={13} color={C.accent}/>:<User size={13} color={C.accent}/>}
          <span style={{fontSize:12,color:C.accent,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>{role==="admin"?"Company Admin":"Team Member"}</span>
        </div>
        <div style={{fontSize:24,fontWeight:700,color:C.text,fontFamily:"'Playfair Display',serif"}}>Sign in</div>
        <div style={{fontSize:14,color:C.muted,marginTop:4}}>{role==="admin"?"Enter your admin credentials":"Use the credentials your admin sent you"}</div>
      </div>
      <Field label="Email" value={email} onChange={setEmail} type="email" placeholder="you@company.com"/>
      <Field label="Password" value={pass} onChange={setPass} type="password" placeholder="••••••••"/>
      {err&&<div style={{color:C.danger,fontSize:13,marginBottom:14,padding:"10px 14px",background:"#FDECEA",borderRadius:10}}>{err}</div>}
      <Btn onClick={go} disabled={!email||!pass||loading}>{loading?"Signing in...":"Sign In"}</Btn>
      {role==="employee"&&(
        <div style={{marginTop:20,background:C.card,borderRadius:14,padding:14,border:`1px solid ${C.border}`,textAlign:"center"}}>
          <div style={{fontSize:13,color:C.muted,lineHeight:1.7}}>Don't have an account?<br/><span style={{color:C.text,fontWeight:600}}>Ask your company admin to invite you.</span></div>
        </div>
      )}
      {role==="admin"&&(
        <div style={{marginTop:20,textAlign:"center"}}>
          <span style={{fontSize:13,color:C.muted}}>New to perk.? </span>
          <button onClick={onCreateCompany} style={{background:"none",border:"none",color:C.accent,fontSize:13,fontWeight:700,cursor:"pointer",textDecoration:"underline",padding:0}}>Create your company</button>
        </div>
      )}
    </div>
  );
}

// ── CREATE COMPANY ─────────────────────────────────────────────────────────
const PLANS=[
  {id:"starter",name:"Starter",members:3,price:19,desc:"For small teams getting started"},
  {id:"growth",name:"Growth",members:10,price:49,desc:"For growing teams up to 10"},
  {id:"scale",name:"Scale",members:25,price:99,desc:"For larger organizations up to 25"},
];

function getPlanForSize(n){
  if(n<=3) return PLANS[0];
  if(n<=10) return PLANS[1];
  if(n<=25) return PLANS[2];
  return null;
}

function CreateCompany({onCreate,onBack}){
  const [step,setStep]=useState(1);
  const [teamSize,setTeamSize]=useState("");
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [pass,setPass]=useState("");
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");
  const size=Number(teamSize)||0;
  const selectedPlan=getPlanForSize(size);

  const handleCreate=async()=>{
    if(!name||!email||!pass||!selectedPlan)return;
    setLoading(true);setErr("");
    try{
      const res=await fetch("/api/checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,email,password:pass,plan:selectedPlan.id,team_size:selectedPlan.members})});
      const data=await res.json();
      if(!res.ok){setErr(data.error||"Failed to start checkout");setLoading(false);return;}
      if(data.url){window.location.href=data.url;}else{setErr("No checkout URL returned");setLoading(false);}
    }catch(e){setErr("Something went wrong");setLoading(false);}
  };

  if(step===1) return (
    <div style={{flex:1,overflowY:"auto",padding:"20px"}}>
      <button onClick={onBack} style={{background:"none",border:"none",color:C.muted,fontSize:14,cursor:"pointer",marginBottom:20,padding:0}}>← Back</button>
      <div style={{fontSize:22,fontWeight:900,color:C.text,marginBottom:4}}>How big is your team?</div>
      <div style={{fontSize:14,color:C.muted,marginBottom:24}}>We'll find the right plan for you</div>
      <Field label="Number of team members" value={teamSize} onChange={setTeamSize} type="number" placeholder="e.g. 5"/>
      {size>0&&size<=25&&selectedPlan&&(
        <div style={{background:C.accentBg,border:`2px solid ${C.accent}`,borderRadius:18,padding:"18px",marginBottom:16,marginTop:8}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <div>
              <div style={{fontSize:11,color:C.accent,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:4}}>Recommended plan</div>
              <div style={{fontSize:20,fontWeight:800,color:C.accent}}>{selectedPlan.name}</div>
            </div>
            <div style={{fontSize:24,fontWeight:800,color:C.accent,fontFamily:"'Playfair Display',serif"}}>${selectedPlan.price}<span style={{fontSize:12,fontWeight:400,color:C.muted}}>/mo</span></div>
          </div>
          <div style={{fontSize:13,color:C.muted}}>{selectedPlan.desc}</div>
          <div style={{fontSize:12,color:C.accent,fontWeight:700,marginTop:6}}>Includes up to {selectedPlan.members} team members</div>
        </div>
      )}
      {size>25&&(
        <div style={{background:"#FDF0EA",border:`1.5px solid ${C.pop}`,borderRadius:14,padding:"14px",marginTop:8}}>
          <div style={{fontSize:14,fontWeight:700,color:C.pop,marginBottom:4}}>Need more than 25 seats?</div>
          <div style={{fontSize:13,color:C.muted}}>Contact us for a custom enterprise plan.</div>
        </div>
      )}
      <Btn onClick={()=>setStep(2)} disabled={!size||size<1||size>25||!selectedPlan} style={{marginTop:16}}>Continue</Btn>
      <div style={{marginTop:20}}>
        <div style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:12}}>All plans</div>
        {PLANS.map(p=>(
          <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
            <div>
              <span style={{fontSize:14,fontWeight:700,color:selectedPlan?.id===p.id?C.accent:C.text}}>{p.name}</span>
              <span style={{fontSize:12,color:C.muted,marginLeft:8}}>up to {p.members} members</span>
            </div>
            <span style={{fontSize:14,fontWeight:700,color:C.accent}}>${p.price}/mo</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{flex:1,overflowY:"auto",padding:"20px"}}>
      <button onClick={()=>setStep(1)} style={{background:"none",border:"none",color:C.muted,fontSize:14,cursor:"pointer",marginBottom:20,padding:0}}>← Back</button>
      <div style={{fontSize:22,fontWeight:900,color:C.text,marginBottom:4}}>Create your account</div>
      <div style={{fontSize:14,color:C.muted,marginBottom:24}}>{selectedPlan.name} plan · ${selectedPlan.price}/mo · up to {selectedPlan.members} members</div>
      <Field label="Company Name" value={name} onChange={setName} placeholder="Acme Inc"/>
      <Field label="Admin Email" value={email} onChange={setEmail} type="email" placeholder="you@company.com"/>
      <Field label="Password" value={pass} onChange={setPass} type="password" placeholder="Choose a password"/>
      {err&&<div style={{color:C.danger,fontSize:13,marginBottom:14,padding:"10px 14px",background:"#FDECEA",borderRadius:10}}>{err}</div>}
      <Btn onClick={handleCreate} disabled={!name||!email||!pass||loading}>{loading?"Redirecting to checkout...":"Proceed to Checkout"}</Btn>
    </div>
  );
}

// ── ADMIN DASHBOARD ────────────────────────────────────────────────────────
function AdminDash({company,onHIW}){
  const totalBudget=company.members.reduce((s,m)=>s+m.stipend,0);
  const totalSpent=company.transactions.filter(t=>t.status==="approved").reduce((s,t)=>s+t.amount,0);
  const pending=company.transactions.filter(t=>t.status==="pending").length;
  const catTotals={};
  company.transactions.filter(t=>t.status==="approved").forEach(t=>{catTotals[t.category]=(catTotals[t.category]||0)+t.amount;});
  return (
    <div style={{padding:20}}>
      <div style={{background:`linear-gradient(135deg,${C.accentBg} 0%,#F5F0E0 60%,${C.popBg} 100%)`,border:`2px solid ${C.accentLight}`,borderRadius:24,padding:"24px",marginBottom:20}}>
        <div style={{fontSize:11,color:C.accent,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:8}}>Monthly Budget</div>
        <div style={{fontSize:44,fontWeight:800,color:C.accent,letterSpacing:"-1px",fontFamily:"'Playfair Display',serif"}}>{fmt(totalBudget)}</div>
        <div style={{marginTop:16,display:"flex",gap:20}}>
          {[["Spent",fmt(totalSpent),C.success],["Pending",`${pending} items`,C.warning],["Members",company.members.length,C.text]].map(([l,v,c])=>(
            <div key={l}><div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em"}}>{l}</div><div style={{fontSize:17,fontWeight:800,color:c}}>{v}</div></div>
          ))}
        </div>
        <Bar value={totalSpent} max={totalBudget||1}/>
      </div>
      {Object.keys(catTotals).length>0&&<><SLabel>Spend by Category</SLabel>
      {Object.entries(catTotals).map(([cat,amt])=>(
        <div key={cat} style={{marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:14,color:C.text,fontWeight:600}}>{cat}</span><span style={{fontSize:14,color:C.accent,fontWeight:700}}>{fmt(amt)}</span></div>
          <Bar value={amt} max={totalSpent||1} color={C.accentDark}/>
        </div>
      ))}</>}
      {company.transactions.length>0&&<><SLabel>Recent Activity</SLabel>
      {company.transactions.slice(0,4).map(tx=>(
        <Card key={tx.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px"}}>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <Avatar name={tx.name} size={32}/>
            <div><div style={{fontSize:14,fontWeight:600,color:C.text}}>{tx.merchant}</div><div style={{fontSize:11,color:C.muted}}>{tx.name} · {tx.category}</div></div>
          </div>
          <div style={{textAlign:"right"}}><div style={{fontSize:15,fontWeight:800,color:C.text}}>{fmt(tx.amount)}</div><Badge status={tx.status}/></div>
        </Card>
      ))}</>}
      <div onClick={onHIW} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:"16px",marginTop:4,cursor:"pointer",display:"flex",alignItems:"center",gap:14}}>
        <div style={{width:44,height:44,borderRadius:14,background:C.accentBg,border:`1px solid ${C.accent}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Lightbulb size={20} color={C.accent}/></div>
        <div style={{flex:1}}><div style={{fontSize:14,fontWeight:700,color:C.text}}>How perk. works</div><div style={{fontSize:12,color:C.muted,marginTop:2}}>Pricing, discounts, cards & tax explained</div></div>
        <ChevronRight size={18} color={C.muted}/>
      </div>
    </div>
  );
}

// ── ADMIN PERKS ────────────────────────────────────────────────────────────
function AdminPerks({company,onUpdate}){
  const [adding,setAdding]=useState(false);
  const [editing,setEditing]=useState(null);
  const [iconId,setIconId]=useState("heart");
  const [title,setTitle]=useState("");
  const [desc,setDesc]=useState("");
  const [companyPaid,setCompanyPaid]=useState(false);
  const [costPerPerson,setCostPerPerson]=useState("");
  const [freq,setFreq]=useState("monthly");
  const [taxable,setTaxable]=useState(true);

  const perks=company.perks||[];

  const openAdd=()=>{setIconId("heart");setTitle("");setDesc("");setCompanyPaid(false);setCostPerPerson("");setFreq("monthly");setTaxable(true);setAdding(true);setEditing(null);};
  const openEdit=p=>{setIconId(p.iconId||"heart");setTitle(p.title);setDesc(p.desc);setCompanyPaid(!!p.companyPaid);setCostPerPerson(p.costPerPerson?String(p.costPerPerson):"");setFreq(p.freq||"monthly");setTaxable(p.taxable!==false);setEditing(p.id);setAdding(true);};
  const cancel=()=>{setAdding(false);setEditing(null);};
  const remove=async(id)=>{
    await fetch("/api/perks",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});
    onUpdate({...company,perks:perks.filter(p=>p.id!==id)});
  };

  const save=async()=>{
    if(!title.trim()) return;
    const payload={icon_id:iconId,title,description:desc,company_paid:companyPaid,cost_per_person:companyPaid&&costPerPerson?Number(costPerPerson):null,frequency:companyPaid?freq:null,taxable:companyPaid?taxable:false};
    if(editing){
      const res=await fetch("/api/perks",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:editing,...payload})});
      const p=await res.json();
      onUpdate({...company,perks:perks.map(x=>x.id===editing?{id:p.id,iconId:p.icon_id,title:p.title,desc:p.description,companyPaid:p.company_paid,costPerPerson:p.cost_per_person?Number(p.cost_per_person):null,freq:p.frequency,taxable:p.taxable}:x)});
    } else {
      const res=await fetch("/api/perks",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({company_id:company.id,...payload})});
      const p=await res.json();
      onUpdate({...company,perks:[...perks,{id:p.id,iconId:p.icon_id,title:p.title,desc:p.description,companyPaid:p.company_paid,costPerPerson:p.cost_per_person?Number(p.cost_per_person):null,freq:p.frequency,taxable:p.taxable}]});
    }
    cancel();
  };

  const annualTaxablePerPerson=perks.filter(p=>p.companyPaid&&p.taxable&&p.costPerPerson).reduce((s,p)=>s+(p.freq==="monthly"?p.costPerPerson*12:p.costPerPerson*4),0);

  return (
    <div style={{padding:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div><div style={{fontSize:20,fontWeight:800,color:C.text}}>Perks</div><div style={{fontSize:13,color:C.muted,marginTop:2}}>Benefits shown to your team</div></div>
        {!adding&&<button onClick={openAdd} style={{background:C.accentLight,color:"#1E2012",border:"none",borderRadius:20,padding:"8px 16px",fontSize:13,fontWeight:700,cursor:"pointer"}}>+ Add</button>}
      </div>

      {annualTaxablePerPerson>0&&(
        <div style={{background:C.accentBg,border:`1px solid ${C.success}`,borderRadius:14,padding:"12px 14px",marginBottom:16,marginTop:12,display:"flex",gap:10,alignItems:"flex-start"}}>
          <FileText size={14} color={C.success} style={{flexShrink:0,marginTop:2}}/>
          <div><div style={{fontSize:12,color:C.success,fontWeight:700,marginBottom:2}}>Company-paid taxable perks</div>
          <div style={{fontSize:13,color:C.muted,lineHeight:1.6}}>Each member receives <span style={{color:C.text,fontWeight:700}}>{fmt(annualTaxablePerPerson)}/yr</span> in taxable company-paid benefits — added to year-end totals automatically.</div></div>
        </div>
      )}

      {adding&&(
        <div style={{background:C.accentBg,border:`1px solid ${C.accent}`,borderRadius:18,padding:16,marginBottom:20,marginTop:16}}>
          <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:14}}>{editing?"Edit perk":"New perk"}</div>

          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:8}}>Icon</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {PERK_ICONS.map(({id,Icon,label})=>{
                const active=iconId===id;
                return (
                  <div key={id} onClick={()=>setIconId(id)} style={{width:48,height:48,borderRadius:12,background:active?C.accent:C.card,border:`1.5px solid ${active?C.accent:C.border}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,cursor:"pointer"}}>
                    <Icon size={16} color={active?"#0D1A0D":C.muted}/>
                    <span style={{fontSize:8,color:active?"#0D1A0D":C.muted,fontWeight:600}}>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <Field label="Title" value={title} onChange={setTitle} placeholder="e.g. ClassPass membership"/>
          <Field label="Description" value={desc} onChange={setDesc} placeholder="Tell your team what this means for them..."/>

          <div style={{marginBottom:16}}>
            <div style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:10}}>Benefit type</div>
            <div style={{display:"flex",gap:10}}>
              {[{v:false,label:"Policy / culture",sub:"No cost attached"},{v:true,label:"Company-paid",sub:"You cover the cost"}].map(opt=>(
                <div key={String(opt.v)} onClick={()=>setCompanyPaid(opt.v)} style={{flex:1,padding:"12px",borderRadius:14,background:companyPaid===opt.v?C.accentBg:C.surface,border:`1.5px solid ${companyPaid===opt.v?C.accent:C.border}`,cursor:"pointer",textAlign:"center"}}>
                  <div style={{fontSize:13,fontWeight:700,color:companyPaid===opt.v?C.accent:C.text}}>{opt.label}</div>
                  <div style={{fontSize:11,color:C.muted,marginTop:3}}>{opt.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {companyPaid&&(
            <div style={{background:C.card,borderRadius:14,padding:"14px",marginBottom:14,border:`1px solid ${C.border}`}}>
              <Field label="Cost per person" value={costPerPerson} onChange={setCostPerPerson} type="number" placeholder="e.g. 49"/>
              <div style={{marginBottom:14}}>
                <div style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:10}}>Billed</div>
                <div style={{display:"flex",gap:8}}>
                  {["monthly","quarterly"].map(f=>(
                    <div key={f} onClick={()=>setFreq(f)} style={{flex:1,textAlign:"center",padding:"10px",borderRadius:12,background:freq===f?C.accentBg:C.surface,border:`1.5px solid ${freq===f?C.accent:C.border}`,color:freq===f?C.accent:C.muted,fontWeight:700,fontSize:13,cursor:"pointer",textTransform:"capitalize"}}>{f}</div>
                  ))}
                </div>
              </div>
              <div style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:10}}>Tax treatment</div>
              <div style={{display:"flex",gap:10,marginBottom:12}}>
                {[{v:true,label:"Taxable",sub:"Added to employee income",col:C.warning},{v:false,label:"Non-taxable",sub:"IRS exempt benefit",col:C.success}].map(opt=>(
                  <div key={String(opt.v)} onClick={()=>setTaxable(opt.v)} style={{flex:1,padding:"12px",borderRadius:14,background:taxable===opt.v?`${opt.col}15`:C.surface,border:`1.5px solid ${taxable===opt.v?opt.col:C.border}`,cursor:"pointer"}}>
                    <div style={{fontSize:13,fontWeight:700,color:taxable===opt.v?opt.col:C.text}}>{opt.label}</div>
                    <div style={{fontSize:11,color:C.muted,marginTop:3,lineHeight:1.4}}>{opt.sub}</div>
                  </div>
                ))}
              </div>
              {taxable?(
                <div>
                  <div style={{fontSize:12,color:C.warning,fontWeight:700,marginBottom:8}}>Taxable examples:</div>
                  {TAXABLE_EXAMPLES.map(([Icon,text])=>(
                    <div key={text} style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>
                      <Icon size={14} color={C.muted} style={{flexShrink:0}}/>
                      <span style={{fontSize:12,color:C.muted}}>{text}</span>
                    </div>
                  ))}
                </div>
              ):(
                <div>
                  <div style={{fontSize:12,color:C.success,fontWeight:700,marginBottom:8}}>Non-taxable examples:</div>
                  {NONTAXABLE_EXAMPLES.map(([Icon,text])=>(
                    <div key={text} style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>
                      <Icon size={14} color={C.muted} style={{flexShrink:0}}/>
                      <span style={{fontSize:12,color:C.muted}}>{text}</span>
                    </div>
                  ))}
                  <div style={{marginTop:10,padding:"8px 10px",background:"#D4EDDA",borderRadius:10,border:`1px solid ${C.success}`}}>
                    <span style={{fontSize:11,color:C.accent,fontWeight:600}}>Always confirm non-taxable treatment with your accountant — limits and rules change annually.</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{display:"flex",gap:8,marginTop:4}}>
            <Btn onClick={save} disabled={!title.trim()} style={{flex:1,padding:"11px"}}>{editing?"Save changes":"Add perk"}</Btn>
            <Btn variant="ghost" onClick={cancel} style={{flex:1,padding:"11px"}}>Cancel</Btn>
          </div>
        </div>
      )}

      {!perks.length&&!adding&&(
        <div style={{textAlign:"center",padding:"40px 20px"}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:12}}><Heart size={40} color={C.muted}/></div>
          <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:6}}>No perks yet</div>
          <div style={{fontSize:13,color:C.muted,lineHeight:1.6}}>Add benefits like ClassPass, therapy subscriptions, flexible working, or dress code policies. Company-paid perks are tracked for tax reporting.</div>
        </div>
      )}

      {perks.map(p=>{
        const PerkIcon=getPerkIcon(p.iconId);
        const annualCost=p.companyPaid&&p.costPerPerson?(p.freq==="monthly"?p.costPerPerson*12:p.costPerPerson*4):null;
        return (
          <Card key={p.id}>
            <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
              <div style={{width:48,height:48,borderRadius:14,background:C.accentBg,border:`1px solid ${C.accent}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><PerkIcon size={22} color={C.accent}/></div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,color:C.text,fontSize:15,marginBottom:3}}>{p.title}</div>
                <div style={{fontSize:13,color:C.muted,lineHeight:1.5,marginBottom:8}}>{p.desc}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {!p.companyPaid&&<span style={{fontSize:11,fontWeight:700,color:C.muted,background:C.surface,padding:"3px 10px",borderRadius:20,border:`1px solid ${C.border}`}}>Policy</span>}
                  {p.companyPaid&&p.costPerPerson&&<span style={{fontSize:11,fontWeight:700,color:C.text,background:C.surface,padding:"3px 10px",borderRadius:20,border:`1px solid ${C.border}`}}>{fmt(p.costPerPerson)}/{p.freq==="monthly"?"mo":"qtr"} per person</span>}
                  {p.companyPaid&&<span style={{fontSize:11,fontWeight:700,color:p.taxable?C.warning:C.success,background:p.taxable?"#FEF3DC":"#D4EDDA",padding:"3px 10px",borderRadius:20}}>{p.taxable?"Taxable":"Non-taxable"}</span>}
                  {p.companyPaid&&annualCost&&p.taxable&&<span style={{fontSize:11,fontWeight:700,color:C.warning,background:"#FEF3DC",padding:"3px 10px",borderRadius:20}}>{fmt(annualCost)}/yr taxable</span>}
                </div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6,flexShrink:0}}>
                <button onClick={()=>openEdit(p)} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"5px 10px",color:C.muted,fontSize:12,cursor:"pointer"}}>Edit</button>
                <button onClick={()=>remove(p.id)} style={{background:"none",border:`1px solid ${C.danger}30`,borderRadius:8,padding:"5px 10px",color:C.danger,fontSize:12,cursor:"pointer"}}>Remove</button>
              </div>
            </div>
          </Card>
        );
      })}

      {perks.length>0&&(
        <div style={{marginTop:8,background:C.card,borderRadius:14,padding:14,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:12,color:C.muted,lineHeight:1.7}}>
            {perks.length} perk{perks.length!==1?"s":""} visible to your team.{annualTaxablePerPerson>0?` Company-paid taxable perks add ${fmt(annualTaxablePerPerson)}/yr to each member's reported income.`:""}</div>
        </div>
      )}
    </div>
  );
}

// ── ADMIN TEAM ─────────────────────────────────────────────────────────────
function AdminTeam({company,onAdd,onUpdate}){
  const [tab,setTab]=useState("members");
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,background:C.bg,flexShrink:0}}>
        {[["members","Members"],["perks","Perks"]].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"14px 0",background:"none",border:"none",borderBottom:`2px solid ${tab===id?C.accent:"transparent"}`,color:tab===id?C.accent:C.muted,fontSize:13,fontWeight:700,cursor:"pointer"}}>{label}</button>
        ))}
      </div>
      <div style={{flex:1,overflowY:"auto"}}>
        {tab==="members"&&(
          <div style={{padding:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontSize:20,fontWeight:700,color:C.text,fontFamily:"'Playfair Display',serif"}}>Team</div>
              <button onClick={onAdd} style={{background:C.accentLight,color:"#1E2012",border:"none",borderRadius:20,padding:"8px 16px",fontSize:13,fontWeight:700,cursor:"pointer"}}>+ Add</button>
            </div>
            {!company.members.length&&<div style={{textAlign:"center",padding:"40px 0",color:C.muted,fontSize:14}}>No members yet. Add your first team member.</div>}
            {company.members.map(m=>{
              const spent=company.transactions.filter(t=>t.userId===m.id&&t.status==="approved").reduce((s,t)=>s+t.amount,0);
              return (
                <Card key={m.id}>
                  <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                    <Avatar name={m.name}/>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                        <div><div style={{fontWeight:700,color:C.text,fontSize:15}}>{m.name}</div><div style={{fontSize:12,color:C.muted,marginTop:1}}>{m.email}</div></div>
                        <span style={{fontSize:11,fontWeight:700,color:m.type==="W-2"?C.blue:C.warning,background:m.type==="W-2"?"#DCE8F5":"#FEF3DC",padding:"3px 10px",borderRadius:20}}>{m.type}</span>
                      </div>
                      <div style={{display:"flex",gap:16,marginTop:12}}>
                        {[["Stipend",`${fmt(m.stipend)}/${m.frequency==="monthly"?"mo":"qtr"}`,C.accent],["Spent",fmt(spent),C.success],["Balance",fmt(m.balance),C.text]].map(([l,v,c])=>(
                          <div key={l}><div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em"}}>{l}</div><div style={{fontSize:15,fontWeight:800,color:c}}>{v}</div></div>
                        ))}
                      </div>
                      <Bar value={spent} max={m.stipend||1}/>
                      <div style={{marginTop:10,display:"flex",flexWrap:"wrap",gap:6}}>
                        {m.categories.map(cat=><span key={cat} style={{fontSize:11,color:C.accent,background:C.accentBg,padding:"3px 10px",borderRadius:20,fontWeight:600}}>{cat}</span>)}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
        {tab==="perks"&&<AdminPerks company={company} onUpdate={onUpdate}/>}
      </div>
    </div>
  );
}

// ── ADMIN APPROVALS ────────────────────────────────────────────────────────
function AdminApprovals({company,onUpdate}){
  const [rejectNote,setRejectNote]=useState({});
  const [rejecting,setRejecting]=useState(null);
  const pending=company.transactions.filter(t=>t.status==="pending");
  if(!pending.length) return (
    <div style={{padding:"60px 20px",textAlign:"center"}}>
      <CheckCircle size={52} color={C.success} style={{margin:"0 auto 16px"}}/>
      <div style={{fontSize:18,fontWeight:700,color:C.text}}>All caught up</div>
      <div style={{fontSize:14,color:C.muted,marginTop:8}}>No pending approvals</div>
    </div>
  );
  return (
    <div style={{padding:20}}>
      <div style={{fontSize:20,fontWeight:700,color:C.text,marginBottom:4,fontFamily:"'Playfair Display',serif"}}>Approvals</div>
      <div style={{fontSize:13,color:C.muted,marginBottom:20}}>{pending.length} pending review</div>
      {pending.map(tx=>(
        <Card key={tx.id}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <Avatar name={tx.name} size={36}/>
              <div><div style={{fontWeight:700,color:C.text,fontSize:15}}>{tx.merchant}</div><div style={{fontSize:12,color:C.muted}}>{tx.name} · {tx.date}</div></div>
            </div>
            <div style={{fontSize:20,fontWeight:900,color:C.accent}}>{fmt(tx.amount)}</div>
          </div>
          <span style={{fontSize:12,color:C.accent,background:C.accentBg,padding:"4px 12px",borderRadius:20,fontWeight:600}}>{tx.category}</span>
          {rejecting===tx.id?(
            <div style={{marginTop:12}}>
              <input placeholder="Reason for rejection..." value={rejectNote[tx.id]||""} onChange={e=>setRejectNote({...rejectNote,[tx.id]:e.target.value})}
                style={{width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 12px",color:C.text,fontSize:13,marginBottom:10,boxSizing:"border-box"}}/>
              <div style={{display:"flex",gap:8}}>
                <Btn variant="danger" onClick={()=>{onUpdate(tx.id,"rejected",rejectNote[tx.id]);setRejecting(null);}} style={{flex:1,padding:"11px"}}>Reject</Btn>
                <Btn variant="ghost" onClick={()=>setRejecting(null)} style={{flex:1,padding:"11px"}}>Cancel</Btn>
              </div>
            </div>
          ):(
            <div style={{display:"flex",gap:8,marginTop:12}}>
              <Btn onClick={()=>onUpdate(tx.id,"approved","")} style={{flex:1,padding:"11px"}}>Approve</Btn>
              <Btn variant="ghost" onClick={()=>setRejecting(tx.id)} style={{flex:1,padding:"11px"}}>Reject</Btn>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

// ── ADMIN YEAR END ─────────────────────────────────────────────────────────
function AdminYearEnd({company}){
  const year=new Date().getFullYear();
  const approved=company.transactions.filter(t=>t.status==="approved");
  const totalSpend=approved.reduce((s,t)=>s+t.amount,0);
  const perks=company.perks||[];
  const annualTaxablePerks=perks.filter(p=>p.companyPaid&&p.taxable&&p.costPerPerson).reduce((s,p)=>s+(p.freq==="monthly"?p.costPerPerson*12:p.costPerPerson*4),0);
  const totalPaid=totalSpend+(annualTaxablePerks*company.members.length);
  const byMember=company.members.map(m=>{
    const txs=approved.filter(t=>t.userId===m.id);
    const cardTotal=txs.reduce((s,t)=>s+t.amount,0);
    const byCat={};txs.forEach(t=>{byCat[t.category]=(byCat[t.category]||0)+t.amount;});
    return {...m,cardTotal,annualTaxablePerks,totalReceived:cardTotal+annualTaxablePerks,byCat,txCount:txs.length};
  });
  return (
    <div style={{padding:20}}>
      <div style={{fontSize:20,fontWeight:700,color:C.text,marginBottom:4,fontFamily:"'Playfair Display',serif"}}>Year-End Report</div>
      <div style={{fontSize:13,color:C.muted,marginBottom:20}}>Tax year {year} · {company.name}</div>
      <div style={{background:C.accentBg,border:`1px solid ${C.accent}`,borderRadius:20,padding:"20px",marginBottom:20}}>
        <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>Total taxable benefits</div>
        <div style={{fontSize:38,fontWeight:800,color:C.accentLight,fontFamily:"'Playfair Display',serif"}}>{fmt(totalPaid)}</div>
        <div style={{fontSize:13,color:C.muted,marginTop:8}}>Across {company.members.length} members · {approved.length} transactions</div>
        {annualTaxablePerks>0&&(
          <div style={{marginTop:10,display:"flex",gap:10}}>
            <div style={{flex:1,background:C.card,borderRadius:10,padding:"8px 12px"}}>
              <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em"}}>Card spend</div>
              <div style={{fontSize:16,fontWeight:800,color:C.text,marginTop:2}}>{fmt(totalSpend)}</div>
            </div>
            <div style={{flex:1,background:C.card,borderRadius:10,padding:"8px 12px"}}>
              <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em"}}>Company-paid perks</div>
              <div style={{fontSize:16,fontWeight:800,color:C.warning,marginTop:2}}>{fmt(annualTaxablePerks*company.members.length)}</div>
            </div>
          </div>
        )}
        <div style={{marginTop:12,padding:"10px 14px",background:C.accentBg,borderRadius:12,border:`1px solid ${C.success}`}}>
          <div style={{fontSize:12,color:C.success,fontWeight:700}}>All amounts below are taxable fringe income. Share per-member totals with your accountant for 1099/W-2 reporting.</div>
        </div>
      </div>
      <SLabel>Per-member breakdown</SLabel>
      {byMember.map(m=>(
        <Card key={m.id}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <Avatar name={m.name} size={36}/>
              <div><div style={{fontWeight:700,color:C.text}}>{m.name}</div><div style={{fontSize:12,color:C.muted}}>{m.type} · {m.txCount} transactions</div></div>
            </div>
            <div style={{textAlign:"right"}}><div style={{fontSize:18,fontWeight:900,color:C.accent}}>{fmt(m.totalReceived)}</div><div style={{fontSize:11,color:C.danger,fontWeight:600}}>Taxable income</div></div>
          </div>
          {Object.entries(m.byCat).map(([cat,amt])=>(
            <div key={cat} style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderTop:`1px solid ${C.border}`}}>
              <span style={{fontSize:13,color:C.muted}}>{cat}</span><span style={{fontSize:13,color:C.text,fontWeight:600}}>{fmt(amt)}</span>
            </div>
          ))}
          {m.annualTaxablePerks>0&&(
            <div style={{display:"flex",justifyContent:"space-between",padding:"4px 0",borderTop:`1px solid ${C.border}`}}>
              <span style={{fontSize:13,color:C.warning}}>Company-paid perks</span><span style={{fontSize:13,color:C.warning,fontWeight:600}}>{fmt(m.annualTaxablePerks)}</span>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

// ── ADD MEMBER ─────────────────────────────────────────────────────────────
function AddMember({onAdd,onBack}){
  const [name,setName]=useState("");const [email,setEmail]=useState("");const [pass,setPass]=useState("");
  const [type,setType]=useState("W-2");const [stipend,setStipend]=useState("100");
  const [frequency,setFrequency]=useState("monthly");const [cats,setCats]=useState([]);
  const toggle=c=>setCats(p=>p.includes(c)?p.filter(x=>x!==c):[...p,c]);
  const valid=name&&email&&pass&&cats.length>0;
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <BackHeader title="Add Team Member" onBack={onBack}/>
      <div style={{flex:1,overflowY:"auto",padding:20}}>
        <Field label="Full Name" value={name} onChange={setName} placeholder="Jamie Lee"/>
        <Field label="Email" value={email} onChange={setEmail} type="email" placeholder="jamie@company.com"/>
        <Field label="App Password" value={pass} onChange={setPass} type="password" placeholder="They'll use this to log in"/>
        <SLabel>Employment type</SLabel>
        <div style={{display:"flex",gap:10,marginBottom:18}}>
          {["W-2","1099"].map(t=><div key={t} onClick={()=>setType(t)} style={{flex:1,textAlign:"center",padding:"12px",borderRadius:12,background:type===t?C.accentBg:C.surface,border:`1.5px solid ${type===t?C.accent:C.border}`,color:type===t?C.accent:C.muted,fontWeight:700,fontSize:15,cursor:"pointer"}}>{t}</div>)}
        </div>
        <Field label="Stipend Amount ($)" value={stipend} onChange={setStipend} type="number" placeholder="150"/>
        <SLabel>Frequency</SLabel>
        <div style={{display:"flex",gap:10,marginBottom:18}}>
          {["monthly","quarterly"].map(f=><div key={f} onClick={()=>setFrequency(f)} style={{flex:1,textAlign:"center",padding:"12px",borderRadius:12,background:frequency===f?C.accentBg:C.surface,border:`1.5px solid ${frequency===f?C.accent:C.border}`,color:frequency===f?C.accent:C.muted,fontWeight:700,fontSize:14,cursor:"pointer",textTransform:"capitalize"}}>{f}</div>)}
        </div>
        <SLabel>Approved categories</SLabel>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:24}}>
          {ALL_CATEGORIES.map(cat=><div key={cat} onClick={()=>toggle(cat)} style={{padding:"8px 14px",borderRadius:20,background:cats.includes(cat)?C.accentBg:C.surface,border:`1.5px solid ${cats.includes(cat)?C.accent:C.border}`,color:cats.includes(cat)?C.accent:C.muted,fontSize:13,fontWeight:600,cursor:"pointer"}}>{cat}</div>)}
        </div>
        <Btn onClick={()=>{if(!valid)return;onAdd({id:`u${Date.now()}`,name,email,pass,type,stipend:Number(stipend),frequency,categories:cats,balance:Number(stipend),cardLimit:Number(stipend)});}} disabled={!valid}>Add Member</Btn>
      </div>
    </div>
  );
}

// ── HOW IT WORKS ───────────────────────────────────────────────────────────
function HowItWorks({company,onBack}){
  const balance=company.accountBalance||0;
  const currentTier=getTier(balance);
  const nextTier=TIERS[TIERS.indexOf(currentTier)+1];
  const memberCount=company.members.length;
  const basePrice=calcPrice(memberCount);
  const discounted=(basePrice*(1-currentTier.discount/100)).toFixed(2);
  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <BackHeader title="How perk. works" onBack={onBack}/>
      <div style={{flex:1,overflowY:"auto",padding:20}}>
        <div style={{background:`linear-gradient(135deg,${C.accentBg},#E8F0D8)`,border:`1px solid ${C.accent}`,borderRadius:20,padding:"20px",marginBottom:24}}>
          <div style={{fontSize:11,color:C.accent,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:12}}>Our pricing promise</div>
          <div style={{fontSize:15,color:C.text,lineHeight:1.7,marginBottom:16}}>Simple per-person pricing. <span style={{color:C.accent,fontWeight:700}}>We never take interchange fees</span> — we make money when you subscribe, not when your team spends.</div>
          <div style={{background:C.card,borderRadius:14,padding:"14px 16px",border:`1px solid ${C.border}`}}>
            {[["Base fee (up to 3 members)","$19/mo"],["Each additional member","+$5/mo"],[`Your team (${memberCount} members)`,`$${basePrice}/mo`]].map(([l,v],i)=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderTop:i>0?`1px solid ${C.border}`:"none"}}>
                <span style={{fontSize:14,color:i===2?C.text:C.muted,fontWeight:i===2?700:400}}>{l}</span>
                <span style={{fontSize:14,color:C.accent,fontWeight:i===2?800:700}}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{marginTop:10,fontSize:12,color:C.muted}}>5 members = $29/mo · 10 members = $54/mo · 20 members = $104/mo</div>
        </div>

        <SLabel>Balance discount tiers</SLabel>
        <div style={{background:C.card,borderRadius:18,border:`1px solid ${C.border}`,padding:"20px",marginBottom:24,textAlign:"center"}}>
          <Wallet size={28} color={C.muted} style={{marginBottom:8}}/>
          <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:6}}>Coming soon</div>
          <div style={{fontSize:13,color:C.muted,lineHeight:1.6}}>Pre-load your wallet to unlock automatic discounts on your monthly subscription. Bronze (10% off), Silver (20% off), and Gold (30% off) tiers will be available soon.</div>
        </div>

        <SLabel>How the money flows</SLabel>
        {HOW_STEPS.map(({StepIcon,title,body},i)=>(
          <div key={i} style={{display:"flex",gap:14,marginBottom:18,alignItems:"flex-start"}}>
            <div style={{width:44,height:44,borderRadius:14,background:C.card,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><StepIcon size={20} color={C.accent}/></div>
            <div style={{flex:1,paddingTop:2}}><div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:4}}>{title}</div><div style={{fontSize:13,color:C.muted,lineHeight:1.65}}>{body}</div></div>
          </div>
        ))}

        <div style={{background:C.accentBg,border:`1px solid ${C.success}`,borderRadius:16,padding:"16px",marginTop:8,marginBottom:8}}>
          <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}><FileText size={14} color={C.success}/><div style={{fontSize:13,fontWeight:700,color:C.success}}>Tax note</div></div>
          <div style={{fontSize:13,color:C.muted,lineHeight:1.65}}>Benefits paid through perk. are <span style={{color:C.text,fontWeight:600}}>taxable fringe income</span>. W-2 employees: add to Box 1. 1099 contractors: add to Box 1 of their 1099-NEC. Always confirm with your accountant.</div>
        </div>
      </div>
    </div>
  );
}

// ── ADMIN ACCOUNT ──────────────────────────────────────────────────────────
function AdminAccount({company,onUpdate,onShowHIW}){
  const [section,setSection]=useState("account");
  const [addingFunds,setAddingFunds]=useState(false);
  const [fundAmount,setFundAmount]=useState("");
  const [readIds,setReadIds]=useState(()=>{try{return JSON.parse(localStorage.getItem("perk_read_notifs")||"[]");}catch{return[];}});
  const PRESETS=["#5C6B2E","#3D4A1A","#7A9E4E","#8B7355","#4A6FA5","#C0392B","#B8972A","#6B5B45","#556B4A","#2C3E35"];
  const handleLogo=e=>{const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=ev=>onUpdate({...company,logo:ev.target.result});r.readAsDataURL(file);};
  const bc=company.brandColor||C.accent;
  const balance=company.accountBalance||0;
  const memberCount=company.members.length;
  const basePrice=calcPrice(memberCount);
  const currentTier=getTier(balance);
  const nextTier=TIERS[TIERS.indexOf(currentTier)+1];
  const discounted=(basePrice*(1-currentTier.discount/100)).toFixed(2);
  const savings=(basePrice-Number(discounted)).toFixed(2);
  const unread=PERK_NOTIFICATIONS.filter(n=>!readIds.includes(n.id)).length;
  const {TierIcon}=currentTier;

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,background:C.bg,flexShrink:0}}>
        {[["account","Account"],["branding","Branding"],["notifs","Messages"]].map(([id,label])=>(
          <button key={id} onClick={()=>setSection(id)} style={{flex:1,padding:"14px 0",background:"none",border:"none",borderBottom:`2px solid ${section===id?C.accent:"transparent"}`,color:section===id?C.accent:C.muted,fontSize:13,fontWeight:700,cursor:"pointer",position:"relative"}}>
            {label}{id==="notifs"&&unread>0&&<span style={{position:"absolute",top:6,right:8,background:C.danger,color:C.white,fontSize:9,fontWeight:800,width:16,height:16,borderRadius:"50%",display:"inline-flex",alignItems:"center",justifyContent:"center"}}>{unread}</span>}
          </button>
        ))}
      </div>
      <div style={{flex:1,overflowY:"auto"}}>

        {section==="account"&&(
          <div style={{padding:20}}>
            <div style={{background:`linear-gradient(135deg,${C.accentBg},#E8F0D8)`,border:`1px solid ${C.accent}`,borderRadius:22,padding:"22px",marginBottom:20,textAlign:"center"}}>
              <Wallet size={32} color={C.accent} style={{marginBottom:10}}/>
              <div style={{fontSize:18,fontWeight:800,color:C.text,marginBottom:6,fontFamily:"'Playfair Display',serif"}}>Wallet & Discounts</div>
              <div style={{fontSize:14,fontWeight:700,color:C.accent,marginBottom:8}}>Coming soon</div>
              <div style={{fontSize:13,color:C.muted,lineHeight:1.6}}>Pre-load your perk. wallet to unlock automatic discounts on your subscription. Bronze (10%), Silver (20%), and Gold (30%) tiers.</div>
            </div>

            <div style={{background:C.card,borderRadius:18,border:`1px solid ${C.border}`,overflow:"hidden",marginBottom:20}}>
              <div style={{padding:"14px 16px",borderBottom:`1px solid ${C.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>Monthly subscription</div>
                    <div style={{fontSize:28,fontWeight:700,color:C.accentLight,fontFamily:"'Playfair Display',serif"}}>${basePrice}<span style={{fontSize:13,fontWeight:400,color:C.muted}}>/mo</span></div>
                  </div>
                  <button onClick={onShowHIW} style={{background:C.accentBg,border:`1px solid ${C.accent}`,borderRadius:12,padding:"8px 12px",fontSize:12,fontWeight:700,color:C.accent,cursor:"pointer"}}>How it works</button>
                </div>
              </div>
              <div style={{padding:"10px 16px"}}>
                {[["Base fee (up to 3)","$19/mo"],[`${Math.max(0,memberCount-3)} extra members x $5`,`$${Math.max(0,memberCount-3)*5}/mo`],[`Total (${memberCount} members)`,`$${basePrice}/mo`]].map(([l,v],i)=>(
                  <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderTop:i>0?`1px solid ${C.border}`:"none"}}>
                    <span style={{fontSize:13,color:i===2?C.text:C.muted,fontWeight:i===2?700:400}}>{l}</span>
                    <span style={{fontSize:13,color:i===2?C.accent:C.text,fontWeight:i===2?800:600}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <SLabel>Account details</SLabel>
            {[["Company",company.name],["Admin email",company.adminEmail],["Members",memberCount],["Active cards",memberCount],["Next billing","Apr 1, 2026"]].map(([l,v])=>(
              <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:`1px solid ${C.border}`}}>
                <span style={{fontSize:14,color:C.muted}}>{l}</span>
                <span style={{fontSize:14,color:C.text,fontWeight:600}}>{v}</span>
              </div>
            ))}
          </div>
        )}

        {section==="branding"&&(
          <div style={{padding:20}}>
            <div style={{fontSize:16,fontWeight:800,color:C.text,marginBottom:4}}>Branding</div>
            <div style={{fontSize:13,color:C.muted,marginBottom:20}}>Customize how your team sees the app</div>
            <div style={{background:`linear-gradient(135deg,${C.accentBg},#E8F0D8)`,border:`2px solid ${bc}`,borderRadius:18,padding:"16px",marginBottom:24}}>
              <div style={{fontSize:11,color:bc,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10}}>Employee view preview</div>
              <div style={{marginBottom:14}}>{company.logo?<img src={company.logo} alt="" style={{height:28,maxWidth:90,objectFit:"contain"}}/>:<div style={{fontSize:16,fontWeight:900,color:bc}}>{company.name}</div>}</div>
              <div style={{background:C.card,borderRadius:12,padding:"12px",border:`1px solid ${bc}40`}}>
                <div style={{fontSize:11,color:C.muted,marginBottom:3}}>Available Balance</div>
                <div style={{fontSize:26,fontWeight:900,color:bc}}>$150.00</div>
                <div style={{marginTop:8,background:C.surface,borderRadius:100,height:5,overflow:"hidden"}}><div style={{width:"35%",height:"100%",background:bc,borderRadius:100}}/></div>
              </div>
            </div>
            <SLabel>Company logo</SLabel>
            <div style={{marginBottom:20}}>
              {company.logo&&(
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12,background:C.card,borderRadius:14,padding:12,border:`1px solid ${C.border}`}}>
                  <img src={company.logo} alt="" style={{height:36,maxWidth:100,objectFit:"contain",borderRadius:8}}/>
                  <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:C.text}}>Logo uploaded</div><div style={{fontSize:11,color:C.muted}}>Showing on employee screens</div></div>
                  <button onClick={()=>onUpdate({...company,logo:null})} style={{background:"none",border:"none",color:C.danger,cursor:"pointer",padding:4,display:"flex"}}>✕</button>
                </div>
              )}
              <label style={{display:"block",background:C.surface,border:`1.5px dashed ${C.border}`,borderRadius:14,padding:"20px",textAlign:"center",cursor:"pointer"}}>
                <input type="file" accept="image/*" onChange={handleLogo} style={{display:"none"}}/>
                <div style={{display:"flex",justifyContent:"center",marginBottom:8}}><Upload size={24} color={C.muted}/></div>
                <div style={{fontSize:13,fontWeight:600,color:C.text}}>{company.logo?"Replace logo":"Upload logo"}</div>
                <div style={{fontSize:11,color:C.muted,marginTop:4}}>PNG, JPG, or SVG</div>
              </label>
            </div>
            <SLabel>Brand color</SLabel>
            <div style={{display:"flex",flexWrap:"wrap",gap:10,marginBottom:14}}>
              {PRESETS.map(color=>(
                <div key={color} onClick={()=>onUpdate({...company,brandColor:color})} style={{width:36,height:36,borderRadius:"50%",background:color,cursor:"pointer",border:`3px solid ${bc===color?"white":"transparent"}`,boxShadow:bc===color?`0 0 0 2px ${color}`:"none"}}/>
              ))}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
              <div style={{flex:1}}><Field label="Custom hex" value={bc} onChange={v=>onUpdate({...company,brandColor:v})} placeholder="#A8D878"/></div>
              <div style={{width:40,height:40,borderRadius:10,background:bc,marginTop:18,border:`1px solid ${C.border}`,flexShrink:0}}/>
            </div>
          </div>
        )}

        {section==="notifs"&&(
          <div style={{padding:20}}>
            <div style={{fontSize:16,fontWeight:800,color:C.text,marginBottom:4}}>Messages from perk.</div>
            <div style={{fontSize:13,color:C.muted,marginBottom:20}}>Updates, tips, and reminders</div>
            {PERK_NOTIFICATIONS.map(n=>{
              const isRead=readIds.includes(n.id);
              const NIcon=NOTIF_ICONS[n.type]||Info;
              return (
                <Card key={n.id} onClick={()=>{const updated=[...new Set([...readIds,n.id])];setReadIds(updated);try{localStorage.setItem("perk_read_notifs",JSON.stringify(updated));}catch{}}} style={{opacity:isRead?0.6:1}}>
                  <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                    <div style={{width:40,height:40,borderRadius:12,background:isRead?C.surface:C.accentBg,border:`1px solid ${isRead?C.border:C.accent}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <NIcon size={18} color={isRead?C.muted:C.accent}/>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                        <div style={{fontSize:14,fontWeight:700,color:isRead?C.muted:C.text,flex:1,paddingRight:8}}>{n.title}</div>
                        <div style={{fontSize:11,color:C.muted,flexShrink:0}}>{n.date}</div>
                      </div>
                      <div style={{fontSize:13,color:C.muted,lineHeight:1.6}}>{n.body}</div>
                      {!isRead&&<div style={{marginTop:8,fontSize:11,color:C.accent,fontWeight:600}}>Tap to mark as read</div>}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── ADMIN NAV ICONS ────────────────────────────────────────────────────────
const ADMIN_TABS = [
  {id:"dashboard", NavIcon:Activity,   label:"Home"},
  {id:"team",      NavIcon:User,        label:"Team"},
  {id:"approvals", NavIcon:CheckCircle, label:"Approvals"},
  {id:"yearend",   NavIcon:FileText,    label:"Reports"},
  {id:"account",   NavIcon:Wallet,      label:"Account"},
];

// ── ADMIN APP ──────────────────────────────────────────────────────────────
function AdminApp({company,onUpdate,onRefresh,onLogout}){
  const [tab,setTab]=useState("dashboard");
  const [sub,setSub]=useState(null);
  const pending=company.transactions.filter(t=>t.status==="pending").length;
  const updateTx=async(id,status,note)=>{
    await fetch("/api/transactions",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status,rejection_note:note})});
    onRefresh();
  };
  const maxMembers=company.max_members||3;
  const handleAddMember=async(m)=>{
    await fetch("/api/members",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({company_id:company.id,name:m.name,email:m.email,password:m.pass,employment_type:m.type,stipend_amount:m.stipend,stipend_frequency:m.frequency,categories:m.categories})});
    onRefresh();setSub(null);
  };
  const tryAddMember=()=>{
    if(company.members.length>=maxMembers){setSub("upgrade");return;}
    setSub("addMember");
  };
  if(sub==="upgrade") return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <BackHeader title="Upgrade plan" onBack={()=>setSub(null)}/>
      <div style={{flex:1,overflowY:"auto",padding:20}}>
        <div style={{textAlign:"center",padding:"40px 20px"}}>
          <AlertTriangle size={40} color={C.warning} style={{marginBottom:16}}/>
          <div style={{fontSize:20,fontWeight:800,color:C.text,marginBottom:8}}>Team limit reached</div>
          <div style={{fontSize:14,color:C.muted,lineHeight:1.7,marginBottom:24}}>Your {company.plan||"starter"} plan supports up to {maxMembers} members. Upgrade to add more team members.</div>
          {PLANS.filter(p=>p.members>maxMembers).map(p=>(
            <div key={p.id} style={{background:C.card,border:`1.5px solid ${C.border}`,borderRadius:18,padding:"18px",marginBottom:12,textAlign:"left"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontSize:16,fontWeight:800,color:C.text}}>{p.name}</div><div style={{fontSize:12,color:C.muted}}>Up to {p.members} members</div></div>
                <div style={{fontSize:18,fontWeight:800,color:C.accent}}>${p.price}/mo</div>
              </div>
            </div>
          ))}
          <div style={{fontSize:13,color:C.muted,marginTop:16}}>Contact us to upgrade your plan.</div>
        </div>
      </div>
    </div>
  );
  if(sub==="addMember") return <AddMember onAdd={handleAddMember} onBack={()=>setSub(null)}/>;
  if(sub==="hiw") return <HowItWorks company={company} onBack={()=>setSub(null)}/>;
  return (
    <>
      <div style={{padding:"16px 20px 12px",background:C.bg,borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
        <div>
          <div style={{fontSize:11,color:C.pop,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",fontFamily:"'Playfair Display',serif",fontStyle:"italic"}}>perk. admin</div>
          <div style={{fontSize:17,fontWeight:800,color:C.text}}>{company.name}</div>
        </div>
        <button onClick={onLogout} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:20,padding:"6px 14px",color:C.muted,fontSize:12,cursor:"pointer"}}>Sign out</button>
      </div>
      <div style={{flex:1,overflowY:"auto"}}>
        {tab==="dashboard"&&<AdminDash company={company} onHIW={()=>setSub("hiw")}/>}
        {tab==="team"&&<AdminTeam company={company} onAdd={tryAddMember} onUpdate={onUpdate}/>}
        {tab==="approvals"&&<AdminApprovals company={company} onUpdate={updateTx}/>}
        {tab==="yearend"&&<AdminYearEnd company={company}/>}
        {tab==="account"&&<AdminAccount company={company} onUpdate={onUpdate} onShowHIW={()=>setSub("hiw")}/>}
      </div>
      <div style={{height:80,background:C.surface,borderTop:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-around",padding:"0 8px 12px",flexShrink:0}}>
        {ADMIN_TABS.map(({id,NavIcon,label})=>(
          <button key={id} onClick={()=>setTab(id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,background:"none",border:"none",cursor:"pointer",padding:"8px 0",position:"relative"}}>
            {id==="approvals"&&pending>0&&<div style={{position:"absolute",top:2,right:"50%",transform:"translateX(12px)",background:C.danger,color:C.white,fontSize:9,fontWeight:800,width:16,height:16,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center"}}>{pending}</div>}
            <NavIcon size={20} color={tab===id?C.accent:C.muted}/>
            <span style={{fontSize:10,color:tab===id?C.accent:C.muted,fontWeight:700,letterSpacing:"0.04em"}}>{label}</span>
          </button>
        ))}
      </div>
    </>
  );
}

// ── EMPLOYEE NAV ICONS ─────────────────────────────────────────────────────
const EMP_TABS = [
  {id:"home",     EmpIcon:Activity,   label:"Home"},
  {id:"card",     EmpIcon:CreditCard, label:"My Card"},
  {id:"activity", EmpIcon:RefreshCw,  label:"Activity"},
  {id:"benefits", EmpIcon:Gift,       label:"Benefits"},
];

// ── EMPLOYEE HOME ──────────────────────────────────────────────────────────
function EmpHome({member,spent,txs,bc,company,onViewBenefits}){
  const remaining=member.stipend-spent;
  const pct=Math.round((spent/member.stipend)*100);
  const pending=txs.filter(t=>t.status==="pending");
  return (
    <div style={{padding:20}}>
      <div style={{background:`linear-gradient(135deg,${C.accentBg} 0%,#F5F0E0 60%,${C.popBg} 100%)`,border:`2px solid ${C.accentLight}`,borderRadius:24,padding:"28px 24px",marginBottom:20,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-30,right:-30,width:140,height:140,borderRadius:"50%",background:C.pop,opacity:0.06}}/>
        <div style={{position:"absolute",bottom:-20,left:-20,width:100,height:100,borderRadius:"50%",background:C.accent,opacity:0.07}}/>
        <div style={{fontSize:12,color:C.accent,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:6}}>Available Balance</div>
        <div style={{fontSize:48,fontWeight:800,color:C.accent,letterSpacing:"-1px",fontFamily:"'Playfair Display',serif"}}>{fmt(remaining)}</div>
        <div style={{fontSize:13,color:C.muted,marginTop:4}}>of {fmt(member.stipend)} {member.frequency} benefit</div>
        <div style={{marginTop:20}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
            <span style={{fontSize:12,color:C.muted}}>Used {pct}%</span>
            <span style={{fontSize:12,color:C.muted}}>Resets in {member.frequency==="monthly"?"12":"45"} days</span>
          </div>
          <div style={{background:"rgba(0,0,0,0.08)",borderRadius:100,height:6,overflow:"hidden",marginTop:8}}>
            <div style={{width:`${Math.min((spent/member.stipend)*100,100)}%`,height:"100%",background:C.accent,borderRadius:100,transition:"width 0.4s"}}/>
          </div>
        </div>
      </div>
      <SLabel>Your approved categories</SLabel>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:24}}>
        {member.categories.map(cat=><span key={cat} style={{fontSize:13,color:bc,background:`${bc}15`,padding:"6px 14px",borderRadius:20,fontWeight:600,border:`1px solid ${bc}30`}}>{cat}</span>)}
      </div>
      {pending.length>0&&<>
        <SLabel>Awaiting approval</SLabel>
        {pending.map(tx=>(
          <Card key={tx.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px"}}>
            <div><div style={{fontSize:14,fontWeight:600,color:C.text}}>{tx.merchant}</div><div style={{fontSize:11,color:C.muted}}>{tx.category} · {tx.date}</div></div>
            <div style={{textAlign:"right"}}><div style={{fontSize:15,fontWeight:800,color:C.text}}>{fmt(tx.amount)}</div><Badge status="pending"/></div>
          </Card>
        ))}
      </>}
      <div onClick={onViewBenefits} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:"14px 16px",marginTop:4,cursor:"pointer",display:"flex",alignItems:"center",gap:14,boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
        <div style={{width:44,height:44,borderRadius:14,background:`${bc}15`,border:`1px solid ${bc}30`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Gift size={20} color={bc}/></div>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:700,color:C.text}}>View your full benefits package</div>
          <div style={{fontSize:12,color:C.muted,marginTop:2}}>{(company.perks||[]).length} perks · stipend · tax summary</div>
        </div>
        <ChevronRight size={16} color={C.muted}/>
      </div>
    </div>
  );
}

function EmpCard({member,spent,company,bc}){
  const remaining=member.stipend-spent;
  const [show,setShow]=useState(false);
  return (
    <div style={{padding:20}}>
      <div style={{fontSize:20,fontWeight:700,color:C.text,marginBottom:20,fontFamily:"'Playfair Display',serif"}}>My Perk Card</div>

      {/* Virtual card — keep dark for contrast like a real card */}
      <div style={{background:`linear-gradient(135deg,${C.accentDark} 0%,#1C2410 50%,${C.accentDark} 100%)`,border:`2px solid ${C.accentLight}`,borderRadius:24,padding:"28px 24px",marginBottom:16,position:"relative",overflow:"hidden",minHeight:200}}>
        <div style={{position:"absolute",top:-30,right:-30,width:160,height:160,borderRadius:"50%",background:C.accentLight,opacity:0.07}}/>
        <div style={{position:"absolute",bottom:-30,left:-20,width:120,height:120,borderRadius:"50%",background:C.pop,opacity:0.08}}/>
        <div style={{marginBottom:28}}>{company.logo?<img src={company.logo} alt="" style={{height:28,maxWidth:100,objectFit:"contain",filter:"brightness(0) invert(1)",opacity:0.9}}/>:<div style={{fontSize:20,fontWeight:900,color:C.accentLight,fontFamily:"'Playfair Display',serif",fontStyle:"italic"}}>{company.name}</div>}</div>
        <div style={{fontSize:17,letterSpacing:"0.25em",color:"rgba(255,255,255,0.9)",fontWeight:400,marginBottom:20,fontFamily:"'Source Serif 4',serif"}}>{show?"4242  4242  4242  4242":"••••  ••••  ••••  4242"}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
          <div><div style={{fontSize:10,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:"0.08em"}}>Cardholder</div><div style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,0.9)",letterSpacing:"0.05em"}}>{member.name.toUpperCase()}</div></div>
          <div style={{textAlign:"right"}}><div style={{fontSize:10,color:"rgba(255,255,255,0.5)",textTransform:"uppercase",letterSpacing:"0.08em"}}>Available</div><div style={{fontSize:20,fontWeight:800,color:C.accentLight,fontFamily:"'Playfair Display',serif"}}>{fmt(remaining)}</div></div>
        </div>
      </div>

      {/* Wallet buttons */}
      <div style={{display:"flex",gap:10,marginBottom:16}}>
        <div style={{flex:1,background:"#000",borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"center",gap:8,cursor:"pointer"}}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
          <span style={{fontSize:13,fontWeight:600,color:"white",letterSpacing:"0.02em"}}>Add to Apple Wallet</span>
        </div>
        <div style={{flex:1,background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"center",gap:8,cursor:"pointer",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          <span style={{fontSize:13,fontWeight:600,color:C.text,letterSpacing:"0.02em"}}>Google Pay</span>
        </div>
      </div>

      <Btn variant="ghost" onClick={()=>setShow(!show)} style={{marginBottom:20}}>{show?"Hide card number":"Reveal card number"}</Btn>

      <SLabel>How to use your card</SLabel>
      <div style={{background:C.accentBg,borderRadius:14,padding:"14px 16px",marginBottom:20,border:`1px solid ${C.border}`}}>
        {[["In person","Add to Apple Pay or Google Pay and tap to pay at any approved merchant."],["Online","Reveal your card number above and enter it at checkout on any website."],["Physical card","Request a physical card from your admin if you need one mailed to you."]].map(([title,body],i)=>(
          <div key={title} style={{display:"flex",gap:12,paddingTop:i>0?12:0,marginTop:i>0?12:0,borderTop:i>0?`1px solid ${C.border}`:"none"}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:C.accent,flexShrink:0,marginTop:6}}/>
            <div><div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:2}}>{title}</div><div style={{fontSize:12,color:C.muted,lineHeight:1.6}}>{body}</div></div>
          </div>
        ))}
      </div>

      <SLabel>Card details</SLabel>
      {[["Available",fmt(remaining)],["Card limit",fmt(member.cardLimit)],["Cycle",member.frequency==="monthly"?"Resets monthly":"Resets quarterly"],["Type",member.type],["Approved at",member.categories.join(", ")]].map(([l,v])=>(
        <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"13px 0",borderBottom:`1px solid ${C.border}`}}>
          <span style={{fontSize:14,color:C.muted}}>{l}</span>
          <span style={{fontSize:14,color:C.text,fontWeight:600,maxWidth:"55%",textAlign:"right"}}>{v}</span>
        </div>
      ))}
      <div style={{marginTop:20,textAlign:"center",fontSize:11,color:C.muted}}>Powered by <span style={{fontFamily:"'Playfair Display',serif",fontStyle:"italic",color:C.pop}}>perk.</span></div>
    </div>
  );
}

function EmpActivity({txs}){
  const sorted=[...txs].sort((a,b)=>new Date(b.date)-new Date(a.date));
  return (
    <div style={{padding:20}}>
      <div style={{fontSize:20,fontWeight:700,color:C.text,marginBottom:20,fontFamily:"'Playfair Display',serif"}}>Activity</div>
      {!sorted.length&&<div style={{textAlign:"center",color:C.muted,fontSize:14,marginTop:40}}>No transactions yet</div>}
      {sorted.map(tx=>(
        <Card key={tx.id}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontSize:15,fontWeight:700,color:C.text}}>{tx.merchant}</div>
              <div style={{fontSize:12,color:C.muted,marginTop:2}}>{tx.category} · {tx.date}</div>
              {tx.note&&tx.status==="rejected"&&<div style={{fontSize:12,color:C.danger,marginTop:6,background:"#FDECEA",padding:"6px 10px",borderRadius:8}}>{tx.note}</div>}
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:16,fontWeight:800,color:tx.status==="rejected"?C.muted:C.text,textDecoration:tx.status==="rejected"?"line-through":"none"}}>{fmt(tx.amount)}</div>
              <div style={{marginTop:4}}><Badge status={tx.status}/></div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function EmpBenefits({member,txs,spent,bc,company}){
  const [section,setSection]=useState("package"); // package | summary
  const year=new Date().getFullYear();
  const approved=txs.filter(t=>t.status==="approved");
  const byCat={};approved.forEach(t=>{byCat[t.category]=(byCat[t.category]||0)+t.amount;});
  const perks=company?.perks||[];
  const companyPaidTaxable=perks.filter(p=>p.companyPaid&&p.taxable&&p.costPerPerson);
  const companyPaidFree=perks.filter(p=>p.companyPaid&&!p.taxable&&p.costPerPerson);
  const policyPerks=perks.filter(p=>!p.companyPaid);
  const annualTaxablePerks=companyPaidTaxable.reduce((s,p)=>s+(p.freq==="monthly"?p.costPerPerson*12:p.costPerPerson*4),0);
  const annualFreePerks=companyPaidFree.reduce((s,p)=>s+(p.freq==="monthly"?p.costPerPerson*12:p.costPerPerson*4),0);
  const total=spent+annualTaxablePerks;
  const remaining=member.stipend-spent;

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      {/* Sub-nav */}
      <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,background:C.bg,flexShrink:0}}>
        {[["package","My Benefits"],["summary","Tax Summary"]].map(([id,label])=>(
          <button key={id} onClick={()=>setSection(id)} style={{flex:1,padding:"14px 0",background:"none",border:"none",borderBottom:`2px solid ${section===id?bc:"transparent"}`,color:section===id?bc:C.muted,fontSize:13,fontWeight:700,cursor:"pointer"}}>{label}</button>
        ))}
      </div>

      <div style={{flex:1,overflowY:"auto"}}>

        {/* ── PACKAGE TAB ── */}
        {section==="package"&&(
          <div style={{padding:20}}>
            <div style={{fontSize:20,fontWeight:700,color:C.text,marginBottom:4,fontFamily:"'Playfair Display',serif"}}>Your benefits</div>
            <div style={{fontSize:13,color:C.muted,marginBottom:20}}>Everything {company.name} provides</div>

            {/* Spending stipend */}
            <div style={{background:`linear-gradient(135deg,${bc}20,${C.accentBg})`,border:`1px solid ${bc}`,borderRadius:20,padding:"18px 20px",marginBottom:20}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                <div style={{width:40,height:40,borderRadius:12,background:`${bc}25`,border:`1.5px solid ${bc}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <CreditCard size={20} color={bc}/>
                </div>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:C.text}}>Spending stipend</div>
                  <div style={{fontSize:12,color:C.muted}}>Virtual card · {member.frequency} reset</div>
                </div>
                <div style={{marginLeft:"auto",textAlign:"right"}}>
                  <div style={{fontSize:18,fontWeight:900,color:bc}}>{fmt(member.stipend)}<span style={{fontSize:12,fontWeight:400,color:C.muted}}>/{member.frequency==="monthly"?"mo":"qtr"}</span></div>
                </div>
              </div>
              <div style={{background:C.surface,borderRadius:12,padding:"10px 14px"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontSize:12,color:C.muted}}>Remaining balance</span>
                  <span style={{fontSize:13,fontWeight:700,color:bc}}>{fmt(remaining)}</span>
                </div>
                <div style={{background:C.bg,borderRadius:100,height:5,overflow:"hidden"}}>
                  <div style={{width:`${Math.min((spent/member.stipend)*100,100)}%`,height:"100%",background:bc,borderRadius:100}}/>
                </div>
              </div>
              <div style={{marginTop:10,display:"flex",flexWrap:"wrap",gap:6}}>
                {member.categories.map(cat=><span key={cat} style={{fontSize:11,color:bc,background:`${bc}15`,padding:"3px 10px",borderRadius:20,fontWeight:600,border:`1px solid ${bc}25`}}>{cat}</span>)}
              </div>
            </div>

            {/* Company-paid taxable perks */}
            {companyPaidTaxable.length>0&&(
              <>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,marginTop:4}}>
                  <SLabel>Company-paid benefits</SLabel>
                  <span style={{fontSize:11,fontWeight:700,color:C.warning,background:"#FEF3DC",padding:"3px 10px",borderRadius:20,marginBottom:12}}>Taxable income</span>
                </div>
                {companyPaidTaxable.map(p=>{
                  const PerkIcon=getPerkIcon(p.iconId);
                  const annual=p.freq==="monthly"?p.costPerPerson*12:p.costPerPerson*4;
                  return (
                    <Card key={p.id} style={{padding:"14px 16px"}}>
                      <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                        <div style={{width:44,height:44,borderRadius:13,background:C.accentBg,border:`1px solid ${C.accent}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                          <PerkIcon size={20} color={C.accent}/>
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:3}}>{p.title}</div>
                          <div style={{fontSize:13,color:C.muted,lineHeight:1.5,marginBottom:8}}>{p.desc}</div>
                          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                            <span style={{fontSize:11,fontWeight:700,color:C.text,background:C.surface,padding:"3px 10px",borderRadius:20,border:`1px solid ${C.border}`}}>{fmt(p.costPerPerson)}/{p.freq==="monthly"?"mo":"qtr"}</span>
                            <span style={{fontSize:11,fontWeight:700,color:C.warning,background:"#FEF3DC",padding:"3px 10px",borderRadius:20}}>{fmt(annual)}/yr added to income</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </>
            )}

            {/* Company-paid non-taxable perks */}
            {companyPaidFree.length>0&&(
              <>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,marginTop:4}}>
                  <SLabel>Tax-free benefits</SLabel>
                  <span style={{fontSize:11,fontWeight:700,color:C.success,background:"#D4EDDA",padding:"3px 10px",borderRadius:20,marginBottom:12}}>Non-taxable</span>
                </div>
                {companyPaidFree.map(p=>{
                  const PerkIcon=getPerkIcon(p.iconId);
                  const annual=p.freq==="monthly"?p.costPerPerson*12:p.costPerPerson*4;
                  return (
                    <Card key={p.id} style={{padding:"14px 16px"}}>
                      <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                        <div style={{width:44,height:44,borderRadius:13,background:C.accentBg,border:`1px solid ${C.success}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                          <PerkIcon size={20} color={C.success}/>
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:3}}>{p.title}</div>
                          <div style={{fontSize:13,color:C.muted,lineHeight:1.5,marginBottom:8}}>{p.desc}</div>
                          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                            <span style={{fontSize:11,fontWeight:700,color:C.text,background:C.surface,padding:"3px 10px",borderRadius:20,border:`1px solid ${C.border}`}}>{fmt(p.costPerPerson)}/{p.freq==="monthly"?"mo":"qtr"}</span>
                            <span style={{fontSize:11,fontWeight:700,color:C.success,background:"#D4EDDA",padding:"3px 10px",borderRadius:20}}>No tax impact · {fmt(annual)}/yr value</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </>
            )}

            {/* Policy perks */}
            {policyPerks.length>0&&(
              <>
                <SLabel>Workplace policies</SLabel>
                {policyPerks.map(p=>{
                  const PerkIcon=getPerkIcon(p.iconId);
                  return (
                    <Card key={p.id} style={{padding:"14px 16px"}}>
                      <div style={{display:"flex",gap:12,alignItems:"center"}}>
                        <div style={{width:44,height:44,borderRadius:13,background:C.surface,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                          <PerkIcon size={20} color={C.muted}/>
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:3}}>{p.title}</div>
                          <div style={{fontSize:13,color:C.muted,lineHeight:1.5}}>{p.desc}</div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </>
            )}

            {perks.length===0&&(
              <div style={{textAlign:"center",padding:"32px 0"}}>
                <div style={{display:"flex",justifyContent:"center",marginBottom:12}}><Gift size={36} color={C.muted}/></div>
                <div style={{fontSize:14,color:C.muted,lineHeight:1.6}}>Your admin hasn't added any perks yet. Check back soon.</div>
              </div>
            )}
          </div>
        )}

        {/* ── TAX SUMMARY TAB ── */}
        {section==="summary"&&(
          <div style={{padding:20}}>
            <div style={{fontSize:20,fontWeight:700,color:C.text,marginBottom:4,fontFamily:"'Playfair Display',serif"}}>Tax Summary</div>
            <div style={{fontSize:13,color:C.muted,marginBottom:20}}>Tax year {year}</div>

            <div style={{background:`${bc}12`,border:`1px solid ${bc}`,borderRadius:20,padding:"20px",marginBottom:20}}>
              <div style={{fontSize:11,color:C.muted,textTransform:"uppercase",letterSpacing:"0.08em"}}>Total taxable benefits</div>
              <div style={{fontSize:38,fontWeight:800,color:bc,marginTop:4,fontFamily:"'Playfair Display',serif"}}>{fmt(total)}</div>
              <div style={{fontSize:12,color:C.muted,marginTop:8}}>{approved.length} approved card transactions</div>
              {annualTaxablePerks>0&&(
                <div style={{marginTop:10,display:"flex",gap:10}}>
                  <div style={{flex:1,background:C.card,borderRadius:10,padding:"8px 10px"}}>
                    <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.05em"}}>Card spend</div>
                    <div style={{fontSize:15,fontWeight:800,color:C.text,marginTop:2}}>{fmt(spent)}</div>
                  </div>
                  <div style={{flex:1,background:C.card,borderRadius:10,padding:"8px 10px"}}>
                    <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.05em"}}>Company perks</div>
                    <div style={{fontSize:15,fontWeight:800,color:C.warning,marginTop:2}}>{fmt(annualTaxablePerks)}</div>
                  </div>
                </div>
              )}
              <div style={{marginTop:12,background:C.accentBg,borderRadius:10,padding:"10px 12px",border:`1px solid ${C.success}`}}>
                <div style={{fontSize:12,color:C.success,fontWeight:700}}>This will appear as taxable income on your {member.type==="1099"?"1099-NEC":"W-2"}. Keep for your records.</div>
              </div>
            </div>

            {annualFreePerks>0&&(
              <div style={{background:C.accentBg,border:`1px solid ${C.success}`,borderRadius:16,padding:"14px 16px",marginBottom:20}}>
                <div style={{fontSize:12,color:C.success,fontWeight:700,marginBottom:4}}>Non-taxable benefits value</div>
                <div style={{fontSize:24,fontWeight:700,color:C.success,fontFamily:"'Playfair Display',serif"}}>{fmt(annualFreePerks)}/yr</div>
                <div style={{fontSize:12,color:C.muted,marginTop:4}}>This value is NOT added to your taxable income.</div>
              </div>
            )}

            {Object.keys(byCat).length>0&&<><SLabel>Card spend by category</SLabel>
            {Object.entries(byCat).map(([cat,amt])=>(
              <div key={cat} style={{marginBottom:14}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:14,color:C.text,fontWeight:600}}>{cat}</span><span style={{fontSize:14,color:bc,fontWeight:700}}>{fmt(amt)}</span></div>
                <div style={{background:C.surface,borderRadius:100,height:6,overflow:"hidden",marginTop:4}}><div style={{width:`${Math.min((amt/(spent||1))*100,100)}%`,height:"100%",background:bc,borderRadius:100,opacity:0.8}}/></div>
              </div>
            ))}</>}

            {companyPaidTaxable.length>0&&<>
              <SLabel>Taxable perks breakdown</SLabel>
              {companyPaidTaxable.map(p=>{
                const PerkIcon=getPerkIcon(p.iconId);
                const annual=p.freq==="monthly"?p.costPerPerson*12:p.costPerPerson*4;
                return (
                  <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 0",borderBottom:`1px solid ${C.border}`}}>
                    <div style={{display:"flex",gap:10,alignItems:"center"}}>
                      <PerkIcon size={16} color={C.muted}/>
                      <div><div style={{fontSize:14,color:C.text,fontWeight:600}}>{p.title}</div><div style={{fontSize:11,color:C.muted}}>{fmt(p.costPerPerson)}/{p.freq==="monthly"?"mo":"qtr"} · paid by company</div></div>
                    </div>
                    <span style={{fontSize:14,color:C.warning,fontWeight:700}}>{fmt(annual)}/yr</span>
                  </div>
                );
              })}
            </>}

            {approved.length>0&&<><SLabel>Card transaction history</SLabel>
            {approved.map(tx=>(
              <div key={tx.id} style={{display:"flex",justifyContent:"space-between",padding:"11px 0",borderBottom:`1px solid ${C.border}`}}>
                <div><div style={{fontSize:14,color:C.text,fontWeight:600}}>{tx.merchant}</div><div style={{fontSize:11,color:C.muted}}>{tx.date} · {tx.category}</div></div>
                <span style={{fontSize:14,color:C.text,fontWeight:700}}>{fmt(tx.amount)}</span>
              </div>
            ))}</>}
          </div>
        )}

      </div>
    </div>
  );
}

// ── EMPLOYEE APP ───────────────────────────────────────────────────────────
function EmployeeApp({company,userId,onLogout}){
  const [tab,setTab]=useState("home");
  const member=company.members.find(m=>m.id===userId);
  if(!member) return null;
  const myTxs=company.transactions.filter(t=>t.userId===userId);
  const spent=myTxs.filter(t=>t.status==="approved").reduce((s,t)=>s+t.amount,0);
  const bc=company.brandColor||C.accent;
  return (
    <>
      <div style={{padding:"14px 20px 12px",background:C.bg,borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {company.logo?<img src={company.logo} alt="" style={{height:28,maxWidth:90,objectFit:"contain"}}/>:<div style={{fontSize:16,fontWeight:900,color:bc}}>{company.name}</div>}
          <div style={{width:1,height:20,background:C.border}}/>
          <div style={{fontSize:14,fontWeight:700,color:C.text}}>{member.name.split(" ")[0]}</div>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <Avatar name={member.name} size={30} color={bc}/>
          <button onClick={onLogout} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:20,padding:"5px 12px",color:C.muted,fontSize:12,cursor:"pointer"}}>Out</button>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto"}}>
        {tab==="home"&&<EmpHome member={member} spent={spent} txs={myTxs} bc={bc} company={company} onViewBenefits={()=>setTab("benefits")}/>}
        {tab==="card"&&<EmpCard member={member} spent={spent} company={company} bc={bc}/>}
        {tab==="activity"&&<EmpActivity txs={myTxs}/>}
        {tab==="benefits"&&<EmpBenefits member={member} txs={myTxs} spent={spent} bc={bc} company={company}/>}
      </div>
      <div style={{height:80,background:C.surface,borderTop:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-around",padding:"0 8px 12px",flexShrink:0}}>
        {EMP_TABS.map(({id,EmpIcon,label})=>(
          <button key={id} onClick={()=>setTab(id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,background:"none",border:"none",cursor:"pointer",padding:"8px 0"}}>
            <EmpIcon size={20} color={tab===id?bc:C.muted}/>
            <span style={{fontSize:10,color:tab===id?bc:C.muted,fontWeight:700,letterSpacing:"0.04em"}}>{label}</span>
          </button>
        ))}
      </div>
    </>
  );
}

// ── ROOT ───────────────────────────────────────────────────────────────────
function loadSession(){
  if(typeof window==="undefined")return null;
  try{const s=localStorage.getItem("perk_session");return s?JSON.parse(s):null;}catch{return null;}
}
function saveSession(data){
  if(typeof window==="undefined")return;
  try{localStorage.setItem("perk_session",JSON.stringify(data));}catch{}
}
function clearSession(){
  if(typeof window==="undefined")return;
  localStorage.removeItem("perk_session");
}

function adaptCompany(raw,members,transactions,perks){
  return {
    ...raw,
    adminEmail:raw.admin_email,
    brandColor:raw.brand_color||C.accent,
    accountBalance:Number(raw.account_balance)||0,
    members:(members||[]).map(m=>({
      id:m.id,name:m.name,email:m.email,type:m.employment_type,
      stipend:Number(m.stipend_amount),frequency:m.stipend_frequency,
      categories:m.categories||[],balance:Number(m.balance),cardLimit:Number(m.card_limit),
    })),
    transactions:(transactions||[]).map(t=>({
      id:t.id,userId:t.member_id,name:t.member_name,amount:Number(t.amount),
      merchant:t.merchant,category:t.category,date:t.transaction_date,
      status:t.status,note:t.rejection_note||"",
    })),
    perks:(perks||[]).map(p=>({
      id:p.id,iconId:p.icon_id,title:p.title,desc:p.description,
      companyPaid:p.company_paid,costPerPerson:p.cost_per_person?Number(p.cost_per_person):null,
      freq:p.frequency,taxable:p.taxable,
    })),
  };
}

export default function App(){
  const [screen,setScreen]=useState("loading");
  const [companyData,setCompanyData]=useState(null);
  const [userId,setUserId]=useState(null);
  const [sessionInfo,setSessionInfo]=useState(null);

  const fetchData=async(companyId)=>{
    const [company,members,transactions,perks]=await Promise.all([
      fetch(`/api/companies?id=${companyId}`).then(r=>r.json()),
      fetch(`/api/members?company_id=${companyId}`).then(r=>r.json()),
      fetch(`/api/transactions?company_id=${companyId}`).then(r=>r.json()),
      fetch(`/api/perks?company_id=${companyId}`).then(r=>r.json()),
    ]);
    return adaptCompany(company,members,transactions,perks);
  };

  const [checkoutMsg,setCheckoutMsg]=useState(null);

  useEffect(()=>{
    // Handle Stripe Checkout redirect
    const params=new URLSearchParams(window.location.search);
    const checkoutStatus=params.get("checkout");
    const sessionId=params.get("session_id");

    if(checkoutStatus==="success"&&sessionId){
      // Clean URL
      window.history.replaceState({},"",window.location.pathname);
      setScreen("loading");
      fetch(`/api/checkout?session_id=${sessionId}`)
        .then(r=>r.json())
        .then(data=>{
          if(data.company){
            setCheckoutMsg("Account created! Please log in.");
            setScreen("login");
          }else{
            setCheckoutMsg(data.error||"Something went wrong verifying your payment.");
            setScreen("login");
          }
        })
        .catch(()=>{
          setCheckoutMsg("Payment received but account setup failed. Please contact support.");
          setScreen("login");
        });
      return;
    }

    if(checkoutStatus==="cancelled"){
      window.history.replaceState({},"",window.location.pathname);
      setCheckoutMsg("Checkout cancelled. You can try again.");
      setScreen("createCompany");
      return;
    }

    const saved=loadSession();
    if(saved&&saved.companyId){
      fetchData(saved.companyId).then(data=>{
        setCompanyData(data);setUserId(saved.userId||null);
        setSessionInfo(saved);setScreen(saved.screen);
      }).catch(()=>{clearSession();setScreen("login");});
    } else {
      setScreen("login");
    }
  },[]);

  const onRefresh=async()=>{
    if(!sessionInfo?.companyId)return;
    const data=await fetchData(sessionInfo.companyId);
    setCompanyData(data);
  };

  const login=async(role,uid,companyId)=>{
    const data=await fetchData(companyId);
    const s={screen:role==="admin"?"admin":"employee",userId:uid,companyId};
    setCompanyData(data);setUserId(uid);setSessionInfo(s);setScreen(s.screen);
    saveSession(s);
  };

  const createCo=(company)=>{
    setScreen("login");
  };

  const logout=()=>{clearSession();setUserId(null);setCompanyData(null);setSessionInfo(null);setScreen("login");};

  const updateCo=(updated)=>{setCompanyData(updated);};

  if(screen==="loading") return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Source Serif 4',Georgia,serif"}}>
      <div style={{fontSize:40,fontWeight:900,color:C.pop,fontFamily:"'Playfair Display',serif",fontStyle:"italic"}}>perk.</div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:C.bg,display:"flex",flexDirection:"column",fontFamily:"'Source Serif 4',Georgia,serif"}}>
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",maxWidth:960,width:"100%",margin:"0 auto"}}>
        {checkoutMsg&&(screen==="login"||screen==="createCompany")&&<div style={{padding:"12px 20px",background:checkoutMsg.includes("created")?"#EBF0DC":"#FDF0EA",color:checkoutMsg.includes("created")?C.success:C.pop,fontSize:14,fontWeight:600,textAlign:"center",borderBottom:`1px solid ${C.border}`}}>{checkoutMsg}</div>}
        {screen==="login"&&<div style={{flex:1,overflowY:"auto"}}><Login onLogin={login} onCreateCompany={()=>{setCheckoutMsg(null);setScreen("createCompany");}}/></div>}
        {screen==="createCompany"&&<div style={{flex:1,overflowY:"auto"}}><CreateCompany onCreate={createCo} onBack={()=>{setCheckoutMsg(null);setScreen("login");}}/></div>}
        {screen==="admin"&&companyData&&<AdminApp company={companyData} onUpdate={updateCo} onRefresh={onRefresh} onLogout={logout}/>}
        {screen==="employee"&&companyData&&<EmployeeApp company={companyData} userId={userId} onLogout={logout}/>}
      </div>
    </div>
  );
}
