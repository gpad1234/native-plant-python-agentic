# NW Native Plant Explorer - Architecture

## System Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        User[👤 User Browser]
    end
    
    subgraph "Docker Containers"
        subgraph "Frontend Container :80"
            Nginx[NGINX Web Server<br/>Port 80]
            React[React + TypeScript<br/>Vite + Tailwind CSS]
        end
        
        subgraph "Backend Container :8000"
            FastAPI[FastAPI Server<br/>Port 8000]
            Python[Python 3.x Runtime]
        end
    end
    
    subgraph "External Services"
        iNaturalist[🌿 iNaturalist API<br/>api.inaturalist.org<br/>5.7M+ observations]
        PlantNet[🔬 PlantNet API<br/>my-api.plantnet.org<br/>Botanical specialist]
        Replicate[🤖 Replicate API<br/>LLaVA Vision Model<br/>Fallback identification]
    end
    
    subgraph "Data Storage"
        Env[.env<br/>API Keys & Config]
    end
    
    User -->|HTTP :80| Nginx
    Nginx -->|Static Files| React
    Nginx -->|/api/* Proxy| FastAPI
    React -->|API Calls| FastAPI
    
    FastAPI -->|Query Plants| iNaturalist
    FastAPI -->|Image Upload<br/>Identify Species| PlantNet
    FastAPI -->|Fallback Vision<br/>Analysis| Replicate
    FastAPI -.->|Load Config| Env
    
    style User fill:#e1f5ff
    style Nginx fill:#90ee90
    style React fill:#61dafb
    style FastAPI fill:#009688
    style Python fill:#3776ab
    style iNaturalist fill:#74ac00
    style PlantNet fill:#8bc34a
    style Replicate fill:#ff9800
    style Env fill:#ffd700
```

## Network Flow Diagram

```mermaid
sequenceDiagram
    actor User
    participant Browser
    participant NGINX
    participant React
    participant FastAPI
    participant iNaturalist
    participant PlantNet
    participant Replicate
    
    User->>Browser: Open Application
    Browser->>NGINX: GET / (Port 80)
    NGINX->>React: Serve Static Files
    React->>Browser: Render UI
    
    Note over User,Browser: Search for Plants
    Browser->>NGINX: GET /api/plants?region=washington
    NGINX->>FastAPI: Proxy to Backend :8000
    FastAPI->>iNaturalist: Query Native Plants
    iNaturalist-->>FastAPI: Return Observations
    FastAPI-->>NGINX: JSON Response
    NGINX-->>Browser: Forward Response
    Browser->>React: Update Plant Grid
    
    Note over User,Browser: Identify Plant via Photo
    User->>Browser: Upload Plant Image
    Browser->>NGINX: POST /api/identify
    NGINX->>FastAPI: Proxy Request
    
    alt PlantNet Available
        FastAPI->>PlantNet: Submit Image
        PlantNet-->>FastAPI: Species Matches
    else PlantNet Fails
        FastAPI->>Replicate: Submit to LLaVA
        Replicate-->>FastAPI: AI Analysis
    end
    
    FastAPI-->>NGINX: Identification Result
    NGINX-->>Browser: Forward Result
    Browser->>React: Display Matches
```

## Component Architecture

```mermaid
graph LR
    subgraph "Frontend Components"
        App[App.tsx<br/>Main Container]
        Search[SearchPanel<br/>Filters & Search]
        Map[PlantMap<br/>Leaflet Map]
        Grid[PlantGrid<br/>Results Display]
        Card[PlantCard<br/>Plant Details]
        Modal[PlantDetailModal<br/>Extended Info]
        Vision[VisionTab<br/>Image Upload]
        Identifier[PlantIdentifier<br/>ID Results]
        Menu[HamburgerMenu<br/>Navigation]
    end
    
    subgraph "API Layer"
        API[api.ts<br/>HTTP Client]
        Types[types/*.ts<br/>TypeScript Models]
    end
    
    subgraph "Backend Endpoints"
        Health[GET /api/health<br/>Health Check]
        Plants[GET /api/plants<br/>Search Plants]
        Stats[GET /api/stats<br/>Statistics]
        Identify[POST /api/identify<br/>Image Upload]
    end
    
    App --> Search
    App --> Map
    App --> Grid
    App --> Vision
    App --> Menu
    Grid --> Card
    Card --> Modal
    Vision --> Identifier
    
    Search --> API
    Map --> API
    Grid --> API
    Vision --> API
    
    API --> Types
    API --> Health
    API --> Plants
    API --> Stats
    API --> Identify
    
    style App fill:#61dafb
    style API fill:#4fc3f7
    style Health fill:#66bb6a
    style Plants fill:#66bb6a
    style Stats fill:#66bb6a
    style Identify fill:#ff9800
```

## Data Flow Architecture

```mermaid
flowchart TD
    A[User Action] --> B{Action Type?}
    
    B -->|Search Plants| C[SearchPanel]
    B -->|View Map| D[PlantMap]
    B -->|Upload Image| E[VisionTab]
    
    C --> F[API: /api/plants]
    D --> F
    E --> G[API: /api/identify]
    
    F --> H[iNaturalist API]
    G --> I{Primary Strategy}
    
    I -->|Success| J[PlantNet API]
    I -->|Fail| K[Replicate LLaVA]
    
    H --> L[Parse & Filter]
    J --> M[Match & Score]
    K --> M
    
    L --> N[Climate Zone Classification]
    N --> O[PlantGrid Display]
    M --> P[PlantIdentifier Display]
    
    O --> Q[PlantCard Components]
    P --> Q
    Q --> R[PlantDetailModal]
    
    style A fill:#e1f5ff
    style C fill:#61dafb
    style D fill:#61dafb
    style E fill:#61dafb
    style F fill:#009688
    style G fill:#009688
    style H fill:#74ac00
    style J fill:#8bc34a
    style K fill:#ff9800
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Local Development"
        Dev[Developer Machine]
        Docker[Docker Engine]
    end
    
    subgraph "Container Orchestration"
        Compose[docker-compose.yml]
    end
    
    subgraph "Built Images"
        FrontImg[nw-plants-frontend<br/>nginx:alpine base]
        BackImg[nw-plants-backend<br/>python:3.11-slim base]
    end
    
    subgraph "Running Containers"
        FrontCont[Frontend Container<br/>Port: 80<br/>Health Checks]
        BackCont[Backend Container<br/>Port: 8000<br/>Health Checks]
    end
    
    subgraph "Configuration Files"
        DockerF[Dockerfile.frontend]
        DockerB[Dockerfile.backend]
        NginxConf[nginx.conf]
        EnvFile[.env]
    end
    
    Dev --> Docker
    Docker --> Compose
    Compose --> DockerF
    Compose --> DockerB
    
    DockerF --> FrontImg
    DockerB --> BackImg
    
    FrontImg --> FrontCont
    BackImg --> BackCont
    
    NginxConf --> FrontCont
    EnvFile --> BackCont
    
    FrontCont -.->|depends_on| BackCont
    
    style Dev fill:#e1f5ff
    style Docker fill:#2496ed
    style Compose fill:#2496ed
    style FrontCont fill:#90ee90
    style BackCont fill:#009688
```

## Technology Stack

```mermaid
mindmap
  root((NW Native Plant Explorer))
    Frontend
      React 18
      TypeScript
      Vite
      Tailwind CSS
      Leaflet Maps
      React Query
    Backend
      Python 3.11
      FastAPI
      Pydantic
      HTTPX
      Uvicorn
    Infrastructure
      Docker
      Docker Compose
      NGINX
      Linux Alpine
    External APIs
      iNaturalist API
      PlantNet API
      Replicate LLaVA
    Features
      Plant Search
      Map Visualization
      Image Identification
      Climate Classification
      Real-time Stats
```

## API Endpoints

| Method | Endpoint | Description | External Service |
|--------|----------|-------------|------------------|
| GET | `/` | API information | - |
| GET | `/api/health` | Health check | - |
| GET | `/api/plants` | Search native plants | iNaturalist |
| GET | `/api/stats` | Regional statistics | iNaturalist |
| POST | `/api/identify` | Image identification | PlantNet → Replicate |

## Port Configuration

- **Frontend (NGINX)**: Port 80
- **Backend (FastAPI)**: Port 8000
- **API Proxy**: `/api/*` → `http://backend:8000`

## Environment Variables

Required in `.env`:
- `REPLICATE_API_TOKEN` - For LLaVA vision model
- `PLANTNET_API_KEY` - For PlantNet identification

## Key Features

1. **Native Plant Search** - Query 5.7M+ observations from iNaturalist
2. **Climate Classification** - Coastal, West Cascades, East Cascades, Puget Sound
3. **Plant Identification** - Dual-strategy (PlantNet + LLaVA fallback)
4. **Interactive Maps** - Leaflet-based visualization
5. **Responsive UI** - Mobile-first design with Tailwind CSS
6. **Health Monitoring** - Docker health checks on both containers
7. **CORS Enabled** - Secure frontend-backend communication
