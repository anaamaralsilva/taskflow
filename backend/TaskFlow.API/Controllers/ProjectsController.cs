using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskFlow.API.Data;
using TaskFlow.API.DTOs;
using TaskFlow.API.Models;
using Microsoft.EntityFrameworkCore;

namespace TaskFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProjectsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> CreateProject(CreateProjectRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim is null)
        {
            return Unauthorized();
        }

        var userId = int.Parse(userIdClaim.Value);

        var project = new Project
        {
            Name = request.Name,
            Description = request.Description,
            StartDate = DateTime.SpecifyKind(request.StartDate, DateTimeKind.Utc),
            DueDate = DateTime.SpecifyKind(request.DueDate, DateTimeKind.Utc),
            Status = "Active",
            CreatedByUserId = userId
        };

        _context.Projects.Add(project);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(CreateProject), new { id = project.Id }, new
        {
            project.Id,
            project.Name,
            project.Description,
            project.StartDate,
            project.DueDate,
            project.Status,
            project.CreatedByUserId,
            project.CreatedAt
        });
    }

    [HttpGet]
public async Task<IActionResult> GetProjects()
{
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

    if (userIdClaim is null)
    {
        return Unauthorized();
    }

    var userId = int.Parse(userIdClaim.Value);

    var projects = await _context.Projects
        .Where(p => p.CreatedByUserId == userId)
        .OrderByDescending(p => p.CreatedAt)
        .Select(p => new
        {
            p.Id,
            p.Name,
            p.Description,
            p.StartDate,
            p.DueDate,
            p.Status,
            p.CreatedAt
        })
        .ToListAsync();

    return Ok(projects);
}
[HttpGet("{id}")]
public async Task<IActionResult> GetProject(int id)
{
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

    if (userIdClaim is null)
    {
        return Unauthorized();
    }

    var userId = int.Parse(userIdClaim.Value);

    var project = await _context.Projects
        .Where(p => p.Id == id && p.CreatedByUserId == userId)
        .Select(p => new
        {
            p.Id,
            p.Name,
            p.Description,
            p.StartDate,
            p.DueDate,
            p.Status,
            p.CreatedAt
        })
        .FirstOrDefaultAsync();

    if (project is null)
    {
        return NotFound(new
        {
            message = "Project not found."
        });
    }

    return Ok(project);
}
[HttpPut("{id}")]
public async Task<IActionResult> UpdateProject(int id, UpdateProjectRequest request)
{
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

    if (userIdClaim is null)
    {
        return Unauthorized();
    }

    var userId = int.Parse(userIdClaim.Value);

    var project = await _context.Projects
        .FirstOrDefaultAsync(p => p.Id == id && p.CreatedByUserId == userId);

    if (project is null)
    {
        return NotFound(new
        {
            message = "Project not found."
        });
    }

    project.Name = request.Name;
    project.Description = request.Description;
    project.StartDate = request.StartDate;
    project.DueDate = request.DueDate;
    project.Status = request.Status;

    await _context.SaveChangesAsync();

    return Ok(new
    {
        project.Id,
        project.Name,
        project.Description,
        project.StartDate,
        project.DueDate,
        project.Status,
        project.CreatedAt
    });
}
[HttpDelete("{id}")]
public async Task<IActionResult> DeleteProject(int id)
{
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

    if (userIdClaim is null)
    {
        return Unauthorized();
    }

    var userId = int.Parse(userIdClaim.Value);

    var project = await _context.Projects
        .FirstOrDefaultAsync(p => p.Id == id && p.CreatedByUserId == userId);

    if (project is null)
    {
        return NotFound(new
        {
            message = "Project not found."
        });
    }

    _context.Projects.Remove(project);
    await _context.SaveChangesAsync();

    return NoContent();
}
}