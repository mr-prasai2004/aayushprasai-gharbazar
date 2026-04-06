# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project file first for better layer caching
COPY Backend/GharBazar/GharBazar.API.csproj ./GharBazar.API.csproj
RUN dotnet restore "GharBazar.API.csproj"

# Copy all source files and publish
COPY Backend/GharBazar/ .
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

EXPOSE 8080

ENTRYPOINT ["dotnet", "GharBazar.API.dll"]
