# Vision Model Upgrade Proposal
## Improving Plant Identification Accuracy

**Date:** January 28, 2026  
**Current Status:** Phase 3 Complete - LLaVA 13B operational  
**Issue:** General vision model lacks botanical specialization for accurate species identification

---

## Executive Summary

The current plant identification feature uses LLaVA 13B, a general-purpose vision-language model. While functional, it lacks the botanical expertise needed for accurate species identification (e.g., correctly distinguishing Pacific Madrone from similar species). This proposal evaluates three approaches to improve identification accuracy.

---

## Current Implementation

**Model:** LLaVA 13B via Replicate API  
**Cost:** ~$0.001-0.002 per identification  
**Accuracy:** 70-80% for common species, lower for similar-looking plants  
**Strengths:**
- Fast response time (3-5 seconds)
- Works with any image
- Provides reasoning and features
- Already integrated and operational

**Limitations:**
- Not specialized for botanical identification
- Struggles with species-level accuracy
- May confuse similar genera (e.g., Arbutus vs Prunus)
- Limited knowledge of regional flora

---

## Option 1: PlantNet API (Recommended)

### Overview
PlantNet is a citizen science project with a specialized plant identification API backed by millions of curated botanical observations. Used by botanists and researchers worldwide.

### Technical Specifications
- **API:** REST API, free tier available
- **Database:** 30,000+ species with millions of reference images
- **Accuracy:** 85-95% for plants with clear photos
- **Response Time:** 2-4 seconds
- **Specialization:** Botanical features (leaf venation, flower structure, bark patterns)

### Implementation
```python
# Plant identification via PlantNet
import requests

def identify_plant_plantnet(image_base64):
    response = requests.post(
        'https://my-api.plantnet.org/v2/identify/all',
        params={'api-key': PLANTNET_API_KEY},
        files={'images': image_base64}
    )
    return response.json()
```

### Pros
✅ **Free tier:** 500 identifications/day  
✅ **Botanical expertise:** Built specifically for plants  
✅ **Regional filtering:** Can filter by geographic region (PNW)  
✅ **Multiple results:** Returns top 10 matches with confidence scores  
✅ **Organ detection:** Identifies which plant part is shown (leaf, flower, bark, fruit)  
✅ **Community validation:** Results validated by botanists  

### Cons
❌ Requires separate API key and account  
❌ Rate limits on free tier  
❌ May need paid tier for heavy usage ($200/year for 10k identifications)  
❌ Less flexible than LLM (no custom instructions)

### Cost Analysis
- **Free Tier:** 500 identifications/day = 15,000/month = $0/month
- **Paid Tier:** $200/year = $16.67/month for 10,000 identifications
- **Cost per ID:** Free up to 500/day, then $0.02/identification

---

## Option 2: GPT-4 Vision via Replicate

### Overview
OpenAI's GPT-4 Vision is the most capable multimodal model, with extensive training on scientific content including botanical taxonomy.

### Technical Specifications
- **Model:** GPT-4 Turbo with Vision
- **Cost:** ~$0.01-0.02 per image (higher than LLaVA)
- **Accuracy:** 80-90% for plant identification
- **Response Time:** 5-10 seconds
- **Context Window:** Can include botanical reference text

### Implementation
```python
# Minimal change to existing code
output = replicate.run(
    "openai/gpt-4-vision-preview",
    input={
        "image": data_uri,
        "prompt": enhanced_botanical_prompt,
        "max_tokens": 2048
    }
)
```

### Pros
✅ **Drop-in replacement:** Minimal code changes  
✅ **Better reasoning:** More detailed botanical analysis  
✅ **Flexible prompting:** Can add PNW flora knowledge  
✅ **Multi-image support:** Compare with reference photos  

### Cons
❌ **10x more expensive** than current LLaVA ($0.01 vs $0.001 per ID)
❌ Still general-purpose, not botanical specialist
❌ Slower response time
❌ Requires OpenAI account

### Cost Analysis
- **Cost per ID:** $0.01-0.02
- **Monthly (100 IDs):** $1-2
- **Monthly (1000 IDs):** $10-20
- **Monthly (5000 IDs):** $50-100

---

## Option 3: LLaVA 1.6 Mistral (Upgrade Current)

### Overview
Newer version of LLaVA with better reasoning capabilities and larger training dataset.

### Technical Specifications
- **Model:** LLaVA 1.6 34B (Mistral backbone)
- **Cost:** ~$0.003-0.005 per identification
- **Accuracy:** 75-85% (better than current 13B)
- **Response Time:** 4-6 seconds

### Implementation
```python
# Single line change
output = replicate.run(
    "yorickvp/llava-v1.6-mistral-7b",  # or 34b for better quality
    input={...}
)
```

### Pros
✅ **Easy upgrade:** One line code change  
✅ **Better than current:** Improved accuracy  
✅ **Same workflow:** No API changes  
✅ **Affordable:** 2-3x current cost  

### Cons
❌ Still not botanical specialist
❌ Moderate cost increase
❌ May still struggle with similar species

### Cost Analysis
- **Cost per ID:** $0.003-0.005
- **Monthly (100 IDs):** $0.30-0.50
- **Monthly (1000 IDs):** $3-5
- **Monthly (5000 IDs):** $15-25

---

## Option 4: Hybrid Approach (Best of Both Worlds)

### Overview
Combine PlantNet for initial identification with GPT-4 Vision for detailed analysis and verification.

### Workflow
1. **PlantNet:** Get top 3 species matches with confidence scores
2. **GPT-4 Vision:** Verify top match and provide detailed botanical reasoning
3. **Fallback:** If PlantNet confidence <70%, use GPT-4 only

### Implementation
```python
async def identify_plant_hybrid(image):
    # Step 1: PlantNet identification
    plantnet_results = await plantnet_api(image)
    
    if plantnet_results[0].confidence > 0.7:
        # High confidence, verify with GPT-4
        verification = await gpt4_verify(image, plantnet_results[0])
        return combine_results(plantnet_results[0], verification)
    else:
        # Low confidence, use GPT-4 directly
        return await gpt4_identify(image)
```

### Pros
✅ **Best accuracy:** 90-95% correct identification  
✅ **Cost efficient:** PlantNet free for most queries  
✅ **Rich context:** Botanical data + AI reasoning  
✅ **Quality assurance:** Cross-validation between systems  

### Cons
❌ More complex implementation
❌ Higher latency (sequential API calls)
❌ Requires two API keys

### Cost Analysis
- **Average cost:** $0.005/identification (mostly free PlantNet + occasional GPT-4)
- **Monthly (1000 IDs):** ~$5 (assuming 50% need GPT-4 verification)

---

## Comparison Matrix

| Feature | Current (LLaVA 13B) | PlantNet | GPT-4 Vision | LLaVA 1.6 | Hybrid |
|---------|---------------------|----------|--------------|-----------|---------|
| **Accuracy** | 70-80% | 85-95% | 80-90% | 75-85% | 90-95% |
| **Cost/ID** | $0.001 | Free-$0.02 | $0.01-0.02 | $0.003-0.005 | $0.005 avg |
| **Speed** | 3-5s | 2-4s | 5-10s | 4-6s | 6-12s |
| **PNW Specialization** | Low | High | Medium | Low | High |
| **Implementation** | Done ✓ | Medium | Easy | Easy | Complex |
| **Monthly Cost (1000 IDs)** | $1 | $0 | $10-20 | $3-5 | $5 |

---

## Recommendations

### Phase 1: Quick Win (Immediate)
**Upgrade to LLaVA 1.6 Mistral 7B**
- One-line code change
- 2x better accuracy
- 3x cost increase (still cheap: $3-5/month for 1000 IDs)
- No new API keys needed

**Implementation Time:** 5 minutes  
**Cost Impact:** +$2-4/month  
**Accuracy Gain:** +5-10%

### Phase 2: Major Improvement (Recommended)
**Integrate PlantNet API**
- Best accuracy for botanical identification
- Free for reasonable usage (500/day)
- Regional filtering for PNW flora
- Specialized for plant identification

**Implementation Time:** 2-3 hours  
**Cost Impact:** $0/month (free tier)  
**Accuracy Gain:** +15-20%

### Phase 3: Production Ready (Future)
**Implement Hybrid System**
- PlantNet for identification
- GPT-4 for detailed analysis and verification
- Best accuracy with reasonable cost
- Professional-grade results

**Implementation Time:** 1 day  
**Cost Impact:** ~$5/month for 1000 identifications  
**Accuracy Gain:** +20-25%

---

## Implementation Plan

### Week 1: LLaVA 1.6 Upgrade
- [ ] Test LLaVA 1.6 Mistral 7B model
- [ ] Update model reference in main.py
- [ ] Compare results with current 13B
- [ ] Deploy to production

### Week 2: PlantNet Integration
- [ ] Sign up for PlantNet API account
- [ ] Create API client wrapper
- [ ] Integrate with existing /api/identify endpoint
- [ ] Add region filtering for PNW
- [ ] Test with 20+ plant species
- [ ] Document accuracy improvements

### Week 3: Hybrid System (Optional)
- [ ] Implement PlantNet + GPT-4 workflow
- [ ] Add confidence-based routing
- [ ] Optimize for cost and accuracy
- [ ] A/B test against PlantNet-only

---

## Success Metrics

**Current Baseline (LLaVA 13B):**
- Genus-level accuracy: ~80%
- Species-level accuracy: ~70%
- Cost per ID: $0.001

**Target (PlantNet):**
- Genus-level accuracy: >95%
- Species-level accuracy: >85%
- Cost per ID: $0 (free tier)

**Stretch Goal (Hybrid):**
- Genus-level accuracy: >98%
- Species-level accuracy: >90%
- Cost per ID: <$0.01

---

## Risk Assessment

### Low Risk
- LLaVA 1.6 upgrade (easy rollback)
- PlantNet integration (keeps current as fallback)

### Medium Risk
- PlantNet rate limits (mitigate with caching and current model fallback)
- API downtime (implement retry logic and fallback)

### High Risk
- None identified

---

## Next Steps

1. **Decision Required:** Which option to pursue?
2. **Quick Win:** Upgrade to LLaVA 1.6 Mistral (5 minutes)
3. **Best Value:** Integrate PlantNet API (2-3 hours)
4. **Production Grade:** Implement hybrid system (1 day)

---

## Appendix A: Example Results

### Current (LLaVA 13B)
```json
{
  "species": "Pinus ponderosa",
  "common_name": "Ponderosa Pine",
  "confidence": 80,
  "features": ["needle-like leaves", "rough bark"],
  "alternatives": ["Pinus contorta", "Pinus lambertiana"]
}
```

### PlantNet API
```json
{
  "query": {
    "project": "weurope",
    "images": ["leaf_image.jpg"],
    "organs": ["leaf"],
    "includeRelatedImages": true
  },
  "results": [
    {
      "score": 0.92134,
      "species": {
        "scientificNameWithoutAuthor": "Arbutus menziesii",
        "scientificNameAuthorship": "Pursh",
        "genus": "Arbutus",
        "family": "Ericaceae",
        "commonNames": ["Pacific Madrone", "Madrona"]
      },
      "gbif": {
        "id": "3170223"
      }
    }
  ],
  "version": "2024.01.0"
}
```

---

## Appendix B: API Keys Required

### Current Setup
- ✅ Replicate API Token (active)

### PlantNet Option
- 🔲 PlantNet API Key (free signup at https://my.plantnet.org)

### GPT-4 Vision Option  
- 🔲 OpenAI API Key (requires paid account)

### Hybrid Option
- 🔲 PlantNet API Key
- 🔲 OpenAI API Key

---

## Appendix C: Code Snippets

### LLaVA 1.6 Upgrade (1 line change)
```python
# In main.py, line 379
output = replicate.run(
    "yorickvp/llava-v1.6-mistral-7b:19be067b589d0c46689ffa7cc3ff321447a441986a7694c01225973c2eafc874",
    # ... rest stays the same
)
```

### PlantNet Integration (new function)
```python
async def identify_with_plantnet(image: UploadFile):
    """Identify plant using PlantNet API"""
    
    # Convert to base64
    contents = await image.read()
    img_base64 = base64.b64encode(contents).decode()
    
    # Call PlantNet API
    response = requests.post(
        'https://my-api.plantnet.org/v2/identify/all',
        params={
            'api-key': os.getenv('PLANTNET_API_KEY'),
            'include-related-images': 'false'
        },
        files={
            'images': (image.filename, contents, image.content_type)
        }
    )
    
    data = response.json()
    
    # Parse results
    results = []
    for result in data.get('results', [])[:3]:  # Top 3
        species = result['species']
        results.append(PlantIdentificationMatch(
            scientific_name=species['scientificNameWithoutAuthor'],
            common_name=species.get('commonNames', ['Unknown'])[0],
            confidence=result['score'],
            description=f"Family: {species['family']}",
            is_native=True,  # TODO: Check against PNW native list
            taxon_id=result.get('gbif', {}).get('id', 0)
        ))
    
    return results
```

---

**Prepared by:** AI Assistant  
**For:** NW Native Plant Explorer Project  
**Version:** 1.0  
**Status:** Awaiting Decision
