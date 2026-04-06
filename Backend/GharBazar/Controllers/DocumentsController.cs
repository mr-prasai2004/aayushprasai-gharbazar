using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using GharBazar.API.DTOs;
using GharBazar.API.Services;
using GharBazar.API.Models;

namespace GharBazar.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DocumentsController : ControllerBase
{
    private readonly IPropertyDocumentRepository _documentRepository;
    private readonly IPropertyRepository _propertyRepository;

    public DocumentsController(
        IPropertyDocumentRepository documentRepository,
        IPropertyRepository propertyRepository)
    {
        _documentRepository = documentRepository;
        _propertyRepository = propertyRepository;
    }

    [HttpGet("property/{propertyId}")]
    public async Task<ActionResult<List<PropertyDocumentDto>>> GetPropertyDocuments(string propertyId)
    {
        var documents = await _documentRepository.GetByPropertyAsync(propertyId);
        return Ok(documents.Select(MapToDocumentDto).ToList());
    }

    [HttpPost("{propertyId}/upload")]
    public async Task<ActionResult<PropertyDocumentDto>> UploadDocument(
        string propertyId,
        [FromBody] DocumentUploadRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var property = await _propertyRepository.GetByIdAsync(propertyId);
        if (property == null)
        {
            return NotFound("Property not found");
        }

        if (property.OwnerId != userId && !User.IsInRole("ADMIN"))
        {
            return Forbid("You don't have permission to upload documents for this property");
        }

        var document = new PropertyDocument
        {
            DocumentId = Guid.NewGuid().ToString(),
            PropertyId = propertyId,
            DocumentType = request.DocumentType,
            DocumentName = request.DocumentName,
            DocumentUrl = request.DocumentUrl,
            UploadedDate = DateTime.UtcNow,
            Verified = false
        };

        await _documentRepository.AddAsync(document);
        
        if (property.VerificationStatus != "pending")
        {
            property.VerificationStatus = "pending";
            await _propertyRepository.UpdateAsync(property);
            await _propertyRepository.SaveChangesAsync();
        }
        
        await _documentRepository.SaveChangesAsync();

        return CreatedAtAction(nameof(GetPropertyDocuments), new { propertyId }, MapToDocumentDto(document));
    }

    [Authorize(Roles = "ADMIN")]
    [HttpPut("{documentId}/verify")]
    public async Task<ActionResult<PropertyDocumentDto>> VerifyDocument(
        string documentId,
        [FromBody] VerifyDocumentRequest request)
    {
        var document = await _documentRepository.GetByIdAsync(documentId);
        if (document == null)
        {
            return NotFound("Document not found");
        }

        document.Verified = request.Verified;
        document.VerificationNotes = request.VerificationNotes;

        await _documentRepository.UpdateAsync(document);
        await _documentRepository.SaveChangesAsync();

        return Ok(MapToDocumentDto(document));
    }

    [HttpDelete("{documentId}")]
    public async Task<IActionResult> DeleteDocument(string documentId)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized();
        }

        var document = await _documentRepository.GetByIdAsync(documentId);
        if (document == null)
        {
            return NotFound("Document not found");
        }

        var property = await _propertyRepository.GetByIdAsync(document.PropertyId);
        if (property?.OwnerId != userId && !User.IsInRole("ADMIN"))
        {
            return Forbid("You don't have permission to delete this document");
        }

        await _documentRepository.DeleteAsync(documentId);
        
        if (property != null && property.VerificationStatus != "pending")
        {
            property.VerificationStatus = "pending";
            await _propertyRepository.UpdateAsync(property);
            await _propertyRepository.SaveChangesAsync();
        }

        await _documentRepository.SaveChangesAsync();

        return NoContent();
    }

    private PropertyDocumentDto MapToDocumentDto(PropertyDocument document)
    {
        return new PropertyDocumentDto
        {
            DocumentId = document.DocumentId,
            PropertyId = document.PropertyId,
            DocumentType = document.DocumentType,
            DocumentUrl = document.DocumentUrl,
            DocumentName = document.DocumentName,
            UploadedDate = document.UploadedDate,
            Verified = document.Verified,
            VerificationNotes = document.VerificationNotes
        };
    }
}

public class VerifyDocumentRequest
{
    public bool Verified { get; set; }
    public string? VerificationNotes { get; set; }
}
