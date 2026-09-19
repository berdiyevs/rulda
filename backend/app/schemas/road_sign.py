from pydantic import BaseModel, ConfigDict


class RoadSignOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    kategoriya: str
    nom: str
    rasm: str


class RoadSignCreate(BaseModel):
    id: str
    kategoriya: str
    nom: str
    rasm: str


class RoadSignUpdate(BaseModel):
    kategoriya: str | None = None
    nom: str | None = None
    rasm: str | None = None
