from django.shortcuts import render
from rest_framework import viewsets
from .models import JobApplication, Communication
from .serializers import JobApplicationSerializer, CommunicationSerializer
# Create your views here.

class JobApplicationViewSet(viewsets.ModelViewSet):
    queryset = JobApplication.objects.all()
    serializer_class = JobApplicationSerializer

class CommunicationViewSet(viewsets.ModelViewSet):
    queryset = Communication.objects.all()
    serializer_class = CommunicationSerializer