# Generated manually for third_party_maps

from django.contrib.postgres.fields import ArrayField
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="POIData",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "external_id",
                    models.CharField(help_text="External API place ID", max_length=255),
                ),
                (
                    "provider",
                    models.CharField(
                        choices=[("kakao", "Kakao Map"), ("google", "Google Maps")],
                        max_length=10,
                    ),
                ),
                ("name", models.CharField(max_length=255)),
                ("address", models.TextField()),
                ("latitude", models.FloatField()),
                ("longitude", models.FloatField()),
                ("phone", models.CharField(blank=True, max_length=50, null=True)),
                ("website", models.URLField(blank=True, null=True)),
                ("rating", models.FloatField(blank=True, null=True)),
                ("price_level", models.IntegerField(blank=True, null=True)),
                (
                    "types",
                    ArrayField(
                        base_field=models.CharField(max_length=100),
                        blank=True,
                        default=list,
                        size=None,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "indexes": [
                    models.Index(
                        fields=["latitude", "longitude"],
                        name="third_party_latitud_3b4e21_idx",
                    ),
                    models.Index(
                        fields=["provider", "external_id"],
                        name="third_party_provide_d97e9d_idx",
                    ),
                ],
            },
        ),
        migrations.CreateModel(
            name="POIReview",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("author_name", models.CharField(max_length=255)),
                ("rating", models.FloatField()),
                ("text", models.TextField()),
                ("review_time", models.DateTimeField()),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "poi",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="reviews",
                        to="third_party_maps.poidata",
                    ),
                ),
            ],
            options={
                "ordering": ["-review_time"],
            },
        ),
        migrations.CreateModel(
            name="POIPhoto",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "photo_reference",
                    models.CharField(
                        help_text="External photo reference", max_length=255
                    ),
                ),
                (
                    "photo_url",
                    models.URLField(
                        blank=True, help_text="Cached photo URL", null=True
                    ),
                ),
                ("width", models.IntegerField(blank=True, null=True)),
                ("height", models.IntegerField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "poi",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="photos",
                        to="third_party_maps.poidata",
                    ),
                ),
            ],
        ),
        migrations.CreateModel(
            name="POIOpeningHours",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "day_of_week",
                    models.IntegerField(
                        choices=[
                            (0, "Monday"),
                            (1, "Tuesday"),
                            (2, "Wednesday"),
                            (3, "Thursday"),
                            (4, "Friday"),
                            (5, "Saturday"),
                            (6, "Sunday"),
                        ]
                    ),
                ),
                ("open_time", models.TimeField(blank=True, null=True)),
                ("close_time", models.TimeField(blank=True, null=True)),
                ("is_closed", models.BooleanField(default=False)),
                (
                    "poi",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="opening_hours",
                        to="third_party_maps.poidata",
                    ),
                ),
            ],
        ),
        migrations.AddConstraint(
            model_name="poidata",
            constraint=models.UniqueConstraint(
                fields=("external_id", "provider"),
                name="third_party_maps_poidata_external_id_provider_uniq",
            ),
        ),
        migrations.AddConstraint(
            model_name="poiopeninghours",
            constraint=models.UniqueConstraint(
                fields=("poi", "day_of_week"),
                name="third_party_maps_poiopeninghours_poi_day_of_week_uniq",
            ),
        ),
    ]
