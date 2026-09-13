from rest_framework import serializers
from .models import (
    JobApplication,
    Communication,
    Resume,
    ResumeSection,
)


class CommunicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Communication
        fields = [
            "id",
            "application",
            "date",
            "communication_type",
            "subject",
            "body",
        ]


class JobApplicationSerializer(serializers.ModelSerializer):
    communications = CommunicationSerializer(many=True, read_only=True)

    class Meta:
        model = JobApplication
        fields = [
            "id",
            "company",
            "position",
            "url",
            "location",
            "salary",
            "date_applied",
            "status",
            "notes",
            "reminder_date",
            "reminder_note",
            "logo_color",
            "tags",
            "resume_customization",
            "communications",
        ]


class ResumeSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResumeSection
        fields = [
            "id",
            "title",
            "type",
            "content",
            "order",
        ]


class ResumeSerializer(serializers.ModelSerializer):
    sections = ResumeSectionSerializer(many=True, read_only=True)

    class Meta:
        model = Resume
        fields = [
            "id",
            "name",
            "email",
            "phone",
            "location",
            "linkedin",
            "github",
            "website",
            "sections",
        ]
