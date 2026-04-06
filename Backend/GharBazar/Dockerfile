# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project file and restore dependencies first (better layer caching)
COPY GharBazar.API.csproj .
RUN dotnet restore "GharBazar.API.csproj"

# Copy all source files and publish
COPY . .
RUN dotnet publish "GharBazar.API.csproj" \
    -c Release \
    -o /app/publish \
    --no-restore \
    /p:UseAppHost=false

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Create wwwroot directory for static file uploads
RUN mkdir -p /app/wwwroot/uploads/images \
             /app/wwwroot/uploads/documents

COPY --from=build /app/publish .

# Railway injects the PORT environment variable at runtime
# ASPNETCORE_URLS is set dynamically in Program.cs via the PORT env var
EXPOSE 8080

ENTRYPOINT ["dotnet", "GharBazar.API.dll"]
