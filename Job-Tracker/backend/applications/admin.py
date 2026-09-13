from django.contrib import admin
from .models import JobApplication

# Register your models here.


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = (
        'company',
        'position',
        'status',
        'date_applied',
        'reminder_date',
    )

    list_filter = ('status',)
    search_fields = ('company', 'position')