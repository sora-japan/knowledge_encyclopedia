from app.services.okf.exporter import to_markdown


@router.get("/{discovery_id}")
def get_id(discovery_id: uuid.UUID, db: Session = Depends(get_db)):
    discovery = db.get(Discovery, discovery_id)
    if discovery is None:
        raise HTTPException(status_code=404, detail="discovery not found")
    str_discovery = to_markdown(discovery)
    
    return 
