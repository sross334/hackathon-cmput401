from django.db import models

# Create your models here.

class JobApplication(models.Model):
    class Status(models.TextChoices):
        SAVED = 'SAVED', 'Saved'
        APPLIED = 'APPLIED', 'Applied'
        INTERVIEW = 'INTERVIEW', 'Interview'
        OFFER = 'OFFER', 'Offer'
        REJECTED = 'REJECTED', 'Rejected'
        WITHDRAWN = 'WITHDRAWN', 'Withdrawn'

    company_name = models.CharField(max_length=200)
    position = models.CharField(max_length=200)

    job_url = models.URLField(blank=True)
    location = models.CharField(max_length=200, blank=True)

    date_applied = models.DateField(null=True, blank=True)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SAVED
    )

    salary = models.CharField(max_length=100, blank=True)
    notes = models.TextField(blank=True)

    follow_up_date = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.company_name} - {self.position}"

class Communication(models.Model):

    class CommunicationType(models.TextChoices):
        EMAIL = 'EMAIL', 'Email'
        PHONE = 'PHONE', 'Phone'
        INTERVIEW = 'INTERVIEW', 'Interview'
        LINKEDIN = 'LINKEDIN', 'LinkedIn'
        OTHER = 'OTHER', 'Other'

    application = models.ForeignKey(
        JobApplication,
        on_delete=models.CASCADE,
        related_name='communications'
    )

    communication_type = models.CharField(
        max_length=20,
        choices=CommunicationType.choices
    )

    date = models.DateTimeField()
    subject = models.CharField(max_length=200, blank=True)
    content = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.application} - {self.communication_type}"