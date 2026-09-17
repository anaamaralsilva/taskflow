using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TaskFlow.API.Data;
using TaskFlow.API.DTOs;
using TaskFlow.API.Models;

namespace TaskFlow.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _context;

    public TasksController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> CreateTask(CreateTaskRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim is null)
        {
            return Unauthorized();
        }

        var userId = int.Parse(userIdClaim.Value);

        var project = await _context.Projects
            .FirstOrDefaultAsync(p =>
                p.Id == request.ProjectId &&
                p.CreatedByUserId == userId);

        if (project is null)
        {
            return NotFound(new
            {
                message = "Project not found."
            });
        }

        var task = new TaskItem
        {
            Title = request.Title,
            Description = request.Description,
            Priority = request.Priority,
            DueDate = request.DueDate,
            ProjectId = request.ProjectId,
            Status = request.Status        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(CreateTask), new { id = task.Id }, new
        {
            task.Id,
            task.Title,
            task.Description,
            task.Status,
            task.Priority,
            task.DueDate,
            task.ProjectId,
            task.CreatedAt
        });
    }
    [HttpGet]
public async Task<IActionResult> GetTasks()
{
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

    if (userIdClaim is null)
    {
        return Unauthorized();
    }

    var userId = int.Parse(userIdClaim.Value);

    var tasks = await _context.Tasks
        .Where(t => t.Project.CreatedByUserId == userId)
        .OrderBy(t => t.DueDate)
        .Select(t => new
        {
            t.Id,
            t.Title,
            t.Description,
            t.Status,
            t.Priority,
            t.DueDate,
            t.ProjectId,
            ProjectName = t.Project.Name,
            t.CreatedAt
        })
        .ToListAsync();

    return Ok(tasks);
}
[HttpGet("{id}")]
public async Task<IActionResult> GetTask(int id)
{
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

    if (userIdClaim is null)
    {
        return Unauthorized();
    }

    var userId = int.Parse(userIdClaim.Value);

    var task = await _context.Tasks
        .Where(t =>
            t.Id == id &&
            t.Project.CreatedByUserId == userId)
        .Select(t => new
        {
            t.Id,
            t.Title,
            t.Description,
            t.Status,
            t.Priority,
            t.DueDate,
            t.ProjectId,
            ProjectName = t.Project.Name,
            t.CreatedAt
        })
        .FirstOrDefaultAsync();

    if (task is null)
    {
        return NotFound(new
        {
            message = "Task not found."
        });
    }

    return Ok(task);
}
[HttpPut("{id}")]
public async Task<IActionResult> UpdateTask(int id, UpdateTaskRequest request)
{
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

    if (userIdClaim is null)
    {
        return Unauthorized();
    }

    var userId = int.Parse(userIdClaim.Value);

    var task = await _context.Tasks
        .Include(t => t.Project)
        .FirstOrDefaultAsync(t =>
            t.Id == id &&
            t.Project.CreatedByUserId == userId);

    if (task is null)
    {
        return NotFound(new
        {
            message = "Task not found."
        });
    }

    task.Title = request.Title;
    task.Description = request.Description;
    task.Status = request.Status;
    task.Priority = request.Priority;
    task.DueDate = request.DueDate;

    await _context.SaveChangesAsync();

    return Ok(new
    {
        task.Id,
        task.Title,
        task.Description,
        task.Status,
        task.Priority,
        task.DueDate,
        task.ProjectId,
        task.CreatedAt
    });
}
[HttpDelete("{id}")]
public async Task<IActionResult> DeleteTask(int id)
{
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

    if (userIdClaim is null)
    {
        return Unauthorized();
    }

    var userId = int.Parse(userIdClaim.Value);

    var task = await _context.Tasks
        .Include(t => t.Project)
        .FirstOrDefaultAsync(t =>
            t.Id == id &&
            t.Project.CreatedByUserId == userId);

    if (task is null)
    {
        return NotFound(new
        {
            message = "Task not found."
        });
    }

    _context.Tasks.Remove(task);
    await _context.SaveChangesAsync();

    return NoContent();
}
}