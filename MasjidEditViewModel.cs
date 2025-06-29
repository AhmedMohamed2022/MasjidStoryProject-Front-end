using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace ViewModels
{
    public class MasjidEditViewModel : MasjidCreateViewModel
    {
        [Required]
        public int Id { get; set; }
        public List<IFormFile>? NewMediaFiles { get; set; }
        public List<int>? MediaIdsToDelete { get; set; }
    }
} 