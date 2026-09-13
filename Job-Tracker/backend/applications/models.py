from django.db import models


class JobApplication(models.Model):
    class Status(models.TextChoices):
        SAVED = 'SAVED', 'Saved'
        APPLIED = 'APPLIED', 'Applied'
        INTERVIEW = 'INTERVIEW', 'Interview'
        OFFER = 'OFFER', 'Offer'
        REJECTED = 'REJECTED', 'Rejected'
        WITHDRAWN = 'WITHDRAWN', 'Withdrawn'

    id = models.CharField(max_length=50, primary_key=True)
    company = models.CharField(
        max_length=255,
        blank=True,
        default="",
    )
    position = models.CharField(max_length=255)
    url = models.URLField(blank=True)
    location = models.CharField(max_length=255, blank=True)
    salary = models.CharField(max_length=100, blank=True)

    date_applied = models.DateField(null=True, blank=True)

    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.APPLIED,
    )

    notes = models.TextField(blank=True)
    reminder_date = models.DateField(null=True, blank=True)
    reminder_note = models.TextField(blank=True)
    logo_color = models.CharField(max_length=20, blank=True)
    resume_customization = models.TextField(blank=True)
    tags = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"{self.company} - {self.position}"


class Communication(models.Model):
    class CommunicationType(models.TextChoices):
        EMAIL = "email", "Email"
        CALL = "call", "Call"
        INTERVIEW = "interview", "Interview"
        OFFER_RECEIVED = "offer_received", "Offer Received"
        REJECTION = "rejection", "Rejection"

    id = models.CharField(max_length=50, primary_key=True)

    application = models.ForeignKey(
        JobApplication,
        on_delete=models.CASCADE,
        related_name="communications",
    )

    communication_type = models.CharField(
        max_length=30,
        choices=CommunicationType.choices,
    )

    date = models.DateField()
    subject = models.CharField(max_length=255, blank=True)
    body = models.TextField()

    def __str__(self):
        return f"{self.application} - {self.communication_type}"


class Resume(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=50, blank=True)
    location = models.CharField(max_length=255, blank=True)
    linkedin = models.URLField(blank=True)
    github = models.URLField(blank=True)
    website = models.URLField(blank=True)

    def __str__(self):
        return self.name


class ResumeSection(models.Model):
    class SectionType(models.TextChoices):
        SUMMARY = "summary", "Summary"
        EXPERIENCE = "experience", "Experience"
        EDUCATION = "education", "Education"
        SKILLS = "skills", "Skills"
        PROJECTS = "projects", "Projects"

    id = models.CharField(max_length=50, primary_key=True)

    resume = models.ForeignKey(
        Resume,
        on_delete=models.CASCADE,
        related_name="sections",
    )

    title = models.CharField(max_length=255)

    type = models.CharField(
        max_length=30,
        choices=SectionType.choices,
    )

    content = models.TextField()
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]
