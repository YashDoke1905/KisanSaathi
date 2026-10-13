from fastapi import APIRouter, File, UploadFile, HTTPException
from app.schemas.ai import (
    CropRecommendationRequest,
    CropRecommendationResponse,
    YieldPredictionRequest,
    YieldPredictionResponse,
    DiseaseDiagnosisResponse,
)
from app.ml.crop_recommender import recommend_crops
from app.ml.yield_predictor import predict_crop_yield
from app.ml.disease_classifier import diagnose_leaf_image

router = APIRouter(prefix="/api/ai", tags=["AI & Machine Learning"])


@router.post("/recommend-crop", response_model=CropRecommendationResponse)
def get_crop_recommendations(request: CropRecommendationRequest):
    return recommend_crops(request)


@router.post("/predict-yield", response_model=YieldPredictionResponse)
def get_yield_prediction(request: YieldPredictionRequest):
    return predict_crop_yield(request)


@router.post("/diagnose-disease", response_model=DiseaseDiagnosisResponse)
async def diagnose_plant_disease(file: UploadFile = File(...)):
    # Validate content type
    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Uploaded file must be a valid image format (JPEG, PNG, WEBP, etc.)"
        )
    
    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(status_code=400, detail="Empty file uploaded")
    
    # Process image
    diagnosis = diagnose_leaf_image(contents, filename=file.filename or "")
    return diagnosis
