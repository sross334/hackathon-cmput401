from django.contrib import admin
from .models import JobApplication

# Register your models here.


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = (
        'company_name',
        'position',
        'status',
        'date_applied',
        'follow_up_date',
    )

    list_filter = ('status',)
    search_fields = ('company_name', 'position')