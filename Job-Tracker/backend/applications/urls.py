from rest_framework.routers import DefaultRouter
from .views import JobApplicationViewSet, CommunicationViewSet

router = DefaultRouter()
router.register(r'applications', JobApplicationViewSet)
router.register(r'communications', CommunicationViewSet)

urlpatterns = router.urls