# LLM Integration Proposal
## NW Native Plant Explorer - AI Enhancement

### Executive Summary
Enhance the Native Plant Explorer with LLM capabilities to provide natural language search, personalized recommendations, and intelligent gardening assistance.

---

## Proposed Features

### 1. Natural Language Search 🔍
**Current:** Users select filters (region, climate zone) manually  
**Proposed:** Natural language queries

**Examples:**
- "Show me drought-tolerant plants for Seattle"
- "What native shrubs attract hummingbirds in Oregon?"
- "Find ground covers for shade in coastal Washington"
- "Plants that bloom in spring and survive zone 8b winters"

**Implementation:**
- Parse user intent with LLM
- Extract: location, plant characteristics, growing conditions
- Convert to structured API queries
- Explain results in natural language

---

### 2. AI Plant Assistant Chatbot 💬
**Feature:** Interactive Q&A about native plants and gardening

**Capabilities:**
- Plant care instructions
- Soil and watering recommendations
- Companion planting suggestions
- Problem diagnosis (yellowing leaves, pests)
- Seasonal planting calendars

**Context-Aware:**
- Uses current search filters
- References visible plants in results
- Remembers conversation history

**Example Conversation:**
```
User: "Why are the leaves on my Oregon grape turning brown?"
Bot: "Oregon grape (Mahonia aquifolium) browning can indicate:
      1. Overwatering - they prefer well-drained soil
      2. Sun scorch - provide afternoon shade in hot climates
      3. Natural winter color change
      Based on your coastal Washington location, it's likely..."
```

---

### 3. Plant Identification from Photos 📸
**Feature:** Upload photo → Identify native plant
**UI:** Hamburger menu → Vision tab

**Workflow:**
1. User opens hamburger menu and selects Vision tab
2. User uploads/captures plant photo
3. Open-source vision model identifies plant
4. Cross-reference with iNaturalist data
5. Show matching native plants in their region
6. Provide care guide and planting info

**Models (Open-Source Only):**
- **LLaVA-Next** (recommended) - Strong plant identification
- **CLIP** - Fast image-text matching
- **Moondream** - Lightweight vision model
- **CogVLM** - High accuracy vision-language model

---

### 4. Personalized Recommendations 🌱
**Feature:** AI-curated plant lists based on user profile

**Inputs:**
- Garden size and type (container, raised bed, landscape)
- Sunlight conditions (full sun, partial shade, full shade)
- Soil type (clay, sandy, loamy)
- Maintenance level (low, medium, high)
- Goals (wildlife habitat, edibles, aesthetics, erosion control)

**Output:**
- Ranked list of suitable native plants
- Reasoning for each recommendation
- Planting layout suggestions
- Maintenance calendar

---

### 5. Generated Care Guides 📝
**Feature:** Dynamic plant care guides with local context

**For Each Plant:**
- Climate-specific growing tips
- Regional considerations (e.g., "In Seattle's wet winters...")
- Propagation methods
- Common pests and diseases in PNW
- Indigenous uses and cultural significance
- Wildlife benefits

**Personalization:**
- Adjusted for user's specific location
- Seasonal timing for their zone
- Local nursery suggestions (if available)

---

## Technical Architecture

### Open-Source LLM Stack (Selected Approach)
**Text Models:**
- **Llama 3.1 8B** (primary) - Fast, efficient for search/chat
- **Mistral 7B** (backup) - Good quality-to-size ratio
- **Phi-3 Mini** (lightweight) - For simple classification tasks

**Vision Models:**
- **LLaVA-Next 13B** (primary) - Best plant identification
- **Moondream 2B** (fallback) - Fast, lightweight

**Hosting Options:**
1. **Replicate API** (Recommended for MVP)
   - Pay-per-use pricing
   - No infrastructure management
   - $0.0001-0.001 per second
   - Easy to start, scale later

2. **HuggingFace Inference API**
   - Free tier available
   - Good for testing
   - May have rate limits

3. **Self-Hosted (Future)**
   - GPU droplet ($100-300/month)
   - Full control and privacy
   - Best long-term costs at scale

**Pros:**
- No vendor lock-in
- Full data privacy
- Customizable and fine-tunable
- Predictable costs
- Community support

**Cons:**
- Slightly more engineering effort
- May need response optimization
- Requires monitoring

---

## Implementation Plan

### Phase 1: Natural Language Search (Week 3)
**Backend:**
```python
# New endpoint in api/main.py
@app.post("/api/search/natural")
async def natural_language_search(query: str):
    # Use LLM to parse query
    intent = await llm_parse_query(query)
    # Convert to structured search
    results = await search_plants(intent)
    return {"results": results, "interpretation": intent}
```

**Frontend:**
- Add search bar with "Ask anything about native plants..."
- Show interpreted query and results
- Suggest follow-up questions

**Estimated Time:** 2-3 days

### Phase 2: Chat Assistant (Week 4)
**Backend:**
```python
# WebSocket for real-time chat
@app.websocket("/ws/chat")
async def chat_endpoint(websocket: WebSocket):
    # Maintain conversation context
    # Query plant database
    # Generate contextual responses
```

**Frontend:**
- Chat interface in sidebar
- Markdown support for formatted responses
- Quick action buttons (search, filter)

**Estimated Time:** 3-4 days

### Phase 3: Photo Identification (Week 5)
**Backend:**
```python
@app.post("/api/identify")
async def identify_plant(file: UploadFile):
    # Send to vision model
    # Match with native species
    # Return top matches with confidence
```

**Frontend:**
- Add Vision tab to hamburger menu
- Camera/upload button in Vision tab
- Loading state with progress
- Results with confidence scores
- Side-by-side comparison view

**Estimated Time:** 2-3 days

### Phase 4: Personalized Recommendations (Week 6)
**Features:**
- User profile creation (optional, stored locally)
- Recommendation engine
- Save favorite plants
- Garden planning tool

**Estimated Time:** 4-5 days

---

## Cost Analysis

### Development Costs
- Week 3-6 implementation: ~20 days
- Testing and refinement: ~5 days
- Total: ~25 development days

### Operational Costs (Monthly)
**Open-Source via Replicate API:**
- 5,000 text queries (Llama 3.1 8B): ~$10-20
- 2,000 chat messages: ~$5-10
- 500 vision queries (LLaVA-Next): ~$25-50
- **Total: ~$40-80/month** at moderate usage

**Open-Source Self-Hosted (Future):**
- GPU droplet (NVIDIA T4): ~$150-200/month
- Or CPU-only with quantized models: ~$50-80/month
- **Total: ~$50-200/month** (better at high scale)

### Revenue Opportunities
- Freemium model: Free basic search, paid for chat/identification
- Nursery partnerships: Affiliate links to buy plants
- Premium features: Garden planning, unlimited chat
- Data insights: Aggregate trends for researchers

---

## Success Metrics

### Engagement
- Average session time increase (target: +50%)
- Queries per user (target: 5+ per session)
- Return visitor rate (target: 40%+)

### Feature Adoption
- % using natural language vs filters (target: 60%+)
- Chat conversations started (target: 30% of users)
- Photo uploads (target: 10% of users)

### Quality
- Search relevance score (user ratings)
- Chat helpfulness (thumbs up/down)
- Identification accuracy (vs verified species)

---

## Risks & Mitigations

### Risk 1: Hallucinations
**Issue:** LLM may invent plant facts  
**Mitigation:**
- Always ground answers in iNaturalist data
- Add disclaimers for care advice
- Include "I don't know" responses
- Human review for critical info

### Risk 2: Cost Overruns
**Issue:** Unexpected API usage  
**Mitigation:**
- Rate limiting per user
- Caching common queries
- Use smaller models for simple tasks
- Monitor and alert on spend

### Risk 3: Poor Quality Results
**Issue:** LLM misunderstands queries  
**Mitigation:**
- Clarifying questions
- Show interpreted query to user
- Easy refinement/correction
- Fallback to traditional search

### Risk 4: Privacy Concerns
**Issue:** User data in API calls  
**Mitigation:**
- Anonymize queries
- No personal data in prompts
- Clear privacy policy
- Option for local processing

---

## Alternatives Considered

### Do Nothing
**Pros:** No development cost  
**Cons:** Missing market opportunity, less engaging

### Simple Keyword Search
**Pros:** Cheaper, simpler  
**Cons:** Less powerful, no conversational features

### Rules-Based Chatbot
**Pros:** Predictable, no API costs  
**Cons:** Brittle, limited understanding

### Partner with Existing Services
**Pros:** Faster to market  
**Cons:** Less control, ongoing revenue share

---

## Recommendation

**Proceed with Phased Approach:**
1. Start with **Natural Language Search** (Phase 1)
2. Use **Llama 3.1 8B via Replicate API** for MVP
3. Add **Vision tab in hamburger menu** (Phase 3)
4. Use **LLaVA-Next** for plant identification
5. Self-host when traffic justifies it

**Rationale:**
- 100% open-source, no vendor lock-in
- Lower costs than commercial APIs
- Full data privacy and control
- Can fine-tune models on native plant data
- Community-driven improvements

**Initial Budget:**
- $40-80/month API costs (Replicate)
- 1 week development time
- Launch as beta feature

---

## Next Steps

1. **Approve scope** for Phase 1 & 3
2. **Set up Replicate account** and get API key
3. **Design prompt templates** for plant search and vision
4. **Implement backend endpoints** with LLM integration
5. **Add hamburger menu with Vision tab** to frontend
6. **Build natural language input** and photo upload UI
7. **Test with real users** and gather feedback
8. **Iterate and expand** to Phase 2 & 4

---

## Appendix: Example Prompts

### Natural Language Search Prompt (Llama 3.1)
```
You are a native plant search assistant for the Pacific Northwest.
Parse this user query and extract:
- Region (washington, oregon, idaho, california)
- Climate zones (coastal, cascade-west, cascade-east, puget-sound)
- Plant characteristics (size, color, season, wildlife value)
- Growing conditions (sun, soil, water)

User query: "{query}"

Return JSON:
{
  "region": "...",
  "climate_zones": [...],
  "characteristics": {...},
  "explanation": "I interpreted your query as..."
}
```

### Chat Assistant Prompt (Llama 3.1)
```
You are a knowledgeable native plant expert for the Pacific Northwest.
Current context: {current_plants_on_screen}
User location: {region}

Rules:
1. Only recommend native plants from iNaturalist database
2. Consider user's climate zone and conditions
3. Be encouraging and educational
4. Admit when you don't know something
5. Suggest specific plants when possible

User: {message}
```

### Vision Plant Identification Prompt (LLaVA-Next)
```
Analyze this plant photo and identify the species.

Focus on:
- Leaf shape, arrangement, and margins
- Flower/fruit characteristics if visible
- Growth form (tree, shrub, forb, grass)
- Bark texture if applicable

Provide:
1. Most likely species (scientific name)
2. Common name(s)
3. Confidence level (0-100%)
4. Key identifying features you observed
5. Alternative possibilities if uncertain

Only suggest species native to the Pacific Northwest.
If not a PNW native plant, indicate that clearly.
```

---

**Document Version:** 1.0  
**Date:** January 26, 2026  
**Author:** AI Development Proposal  
**Status:** Draft for Review
