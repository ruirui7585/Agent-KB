# System Execution Flow

This backend does NOT execute logic directly.

It defines configuration that is consumed by the frontend app.

---

## 1. Flow

backend-config (rules)  
→ system engine (external)  
→ frontend app (female-mvp-v1)  
→ UI rendering result

---

## 2. Rule Types

- traffic-rules.json → controls exposure level
- scheduling-rules.json → defines working time allocation
- risk-rules.json → defines penalty / deactivation
- commission-rules.json → defines payout logic

---

## 3. Important Principle

This repository is:
- NOT runtime code
- NOT API server
- ONLY system definition layer

---

## 4. Consumer System

All configs are consumed by:

/female-mvp-v1 (frontend app)
