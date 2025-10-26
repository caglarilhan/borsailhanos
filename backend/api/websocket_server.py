from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
from datetime import datetime

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Active WebSocket connections
active_connections: list[WebSocket] = []

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    print(f"🔗 New WebSocket connection ({len(active_connections)} active)")
    
    try:
        while True:
            # Send real-time market data
            data = {
                "type": "market_update",
                "timestamp": datetime.now().isoformat(),
                "market": "BIST",
                "signals": [
                    {
                        "symbol": "THYAO",
                        "signal": "BUY",
                        "price": 245.50 + (asyncio.get_event_loop().time() % 10),
                        "confidence": 0.85,
                        "change": "+2.3%"
                    },
                    {
                        "symbol": "AKBNK",
                        "signal": "BUY",
                        "price": 162.80 + (asyncio.get_event_loop().time() % 10),
                        "confidence": 0.78,
                        "change": "+1.8%"
                    }
                ],
                "market_regime": "Risk-On",
                "ai_confidence": 87.3
            }
            
            await websocket.send_json(data)
            await asyncio.sleep(5)  # Send every 5 seconds
            
    except WebSocketDisconnect:
        active_connections.remove(websocket)
        print(f"🔌 WebSocket disconnected ({len(active_connections)} active)")
    except Exception as e:
        print(f"❌ WebSocket error: {e}")
        if websocket in active_connections:
            active_connections.remove(websocket)

@app.get("/ws/stats")
async def websocket_stats():
    """Get WebSocket connection statistics"""
    return {
        "active_connections": len(active_connections),
        "status": "operational"
    }

@app.get("/")
async def root():
    return {"message": "WebSocket Server Running", "version": "1.0"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8081)

