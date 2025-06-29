using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Services;
using ViewModels;

namespace MasjidStory.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MediaController : ControllerBase
    {
        private readonly MediaService _service;

        public MediaController(MediaService service)
        {
            _service = service;
        }

        // POST: api/media/masjid/upload
        [HttpPost("masjid/upload")]
        [Authorize]
        public async Task<IActionResult> UploadMasjidMedia([FromForm] MediaCreateViewModel model)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var success = await _service.UploadMediaAsync(model);
            if (!success)
                return BadRequest(ApiResponse<string>.Fail("Failed to upload media"));

            return Ok(ApiResponse<string>.Ok("Media uploaded successfully."));
        }

        // GET: api/media/masjid/5
        [HttpGet("masjid/{masjidId}")]
        public async Task<ActionResult<List<MediaViewModel>>> GetMasjidMedia(int masjidId)
        {
            var result = await _service.GetMediaByMasjidIdAsync(masjidId);
            return Ok(ApiResponse<List<MediaViewModel>>.Ok(result));
        }
    }
} 