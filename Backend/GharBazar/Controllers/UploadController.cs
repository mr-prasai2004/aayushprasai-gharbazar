using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GharBazar.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UploadController : ControllerBase
{
    private readonly IWebHostEnvironment _environment;

    public UploadController(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    // POST: api/upload/image - Upload single image (for profile)
    [HttpPost("image")]
    [Authorize]
    public async Task<ActionResult<UploadResponse>> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded" });

        // Validate file type
        var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
        if (!allowedTypes.Contains(file.ContentType.ToLower()))
            return BadRequest(new { message = "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed." });

        // Validate file size (max 5MB)
        if (file.Length > 5 * 1024 * 1024)
            return BadRequest(new { message = "File size must be less than 5MB" });

        try
        {
            var uploadPath = Path.Combine(_environment.WebRootPath ?? "wwwroot", "uploads", "profiles");
            Directory.CreateDirectory(uploadPath);

            // Generate unique filename
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Return the public URL
            var fileUrl = $"/uploads/profiles/{fileName}";
            return Ok(new UploadResponse { Url = fileUrl, FileName = fileName });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Upload error: {ex.Message}");
            return StatusCode(500, new { message = "Failed to upload file" });
        }
    }

    // POST: api/upload/images - Upload multiple images (for properties)
    [HttpPost("images")]
    [Authorize]
    public async Task<ActionResult<List<UploadResponse>>> UploadImages(List<IFormFile> files)
    {
        if (files == null || files.Count == 0)
            return BadRequest(new { message = "No files uploaded" });

        var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
        var results = new List<UploadResponse>();

        try
        {
            var uploadPath = Path.Combine(_environment.WebRootPath ?? "wwwroot", "uploads", "properties");
            Directory.CreateDirectory(uploadPath);

            foreach (var file in files)
            {
                // Validate file type
                if (!allowedTypes.Contains(file.ContentType.ToLower()))
                    continue;

                // Validate file size (max 5MB)
                if (file.Length > 5 * 1024 * 1024)
                    continue;

                // Generate unique filename
                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
                var filePath = Path.Combine(uploadPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                var fileUrl = $"/uploads/properties/{fileName}";
                results.Add(new UploadResponse { Url = fileUrl, FileName = fileName });
            }

            return Ok(results);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Upload error: {ex.Message}");
            return StatusCode(500, new { message = "Failed to upload files" });
        }
    }

    // POST: api/upload/document - Upload document (for property documents)
    [HttpPost("document")]
    [Authorize]
    public async Task<ActionResult<UploadResponse>> UploadDocument(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded" });

        // Validate file type - allow images, PDFs, and Word documents
        var allowedTypes = new[] {
            "image/jpeg", "image/png", "image/gif", "image/webp",
            "application/pdf",
            "application/msword",                                          // .doc
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" // .docx
        };
        if (!allowedTypes.Contains(file.ContentType.ToLower()))
            return BadRequest(new { message = "Invalid file type. Only JPEG, PNG, GIF, WebP, PDF, DOC, and DOCX are allowed." });

        // Validate file size (max 10MB for documents)
        if (file.Length > 10 * 1024 * 1024)
            return BadRequest(new { message = "File size must be less than 10MB" });

        try
        {
            var uploadPath = Path.Combine(_environment.WebRootPath ?? "wwwroot", "uploads", "documents");
            Directory.CreateDirectory(uploadPath);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadPath, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var fileUrl = $"/uploads/documents/{fileName}";
            return Ok(new UploadResponse { Url = fileUrl, FileName = fileName });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Upload error: {ex.Message}");
            return StatusCode(500, new { message = "Failed to upload file" });
        }
    }
}

public class UploadResponse
{
    public string Url { get; set; } = string.Empty;
    public string FileName { get; set; } = string.Empty;
}
