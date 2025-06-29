using Models.Entities;
using ViewModels;
using ViewModels.Media;

namespace Models.Extensions
{
    public static class MasjidExtensions
    {
        public static MasjidViewModel ToViewModel(this Masjid masjid)
        {
            return new MasjidViewModel
            {
                Id = masjid.Id,
                ShortName = masjid.ShortName,
                Address = masjid.Address,
                ArchStyle = masjid.ArchStyle,
                Latitude = masjid.Latitude,
                Longitude = masjid.Longitude,
                CountryId = masjid.CountryId,
                CityId = masjid.CityId,
                YearOfEstablishment = masjid.YearOfEstablishment,
                CountryName = masjid.Country?.Name,
                CityName = masjid.City?.Name,
                DateOfRecord = masjid.DateOfRecord,
                MediaItems = masjid.MediaItems?.Select(m => m.ToViewModel()).ToList() ?? new List<MediaViewModel>()
            };
        }

        public static Masjid ToEntity(this MasjidCreateViewModel model)
        {
            return new Masjid
            {
                ShortName = model.ShortName,
                Address = model.Address,
                ArchStyle = model.ArchStyle,
                Latitude = model.Latitude,
                Longitude = model.Longitude,
                CountryId = model.CountryId,
                CityId = model.CityId,
                YearOfEstablishment = model.YearOfEstablishment
            };
        }

        public static void UpdateEntity(this MasjidEditViewModel model, Masjid entity)
        {
            entity.ShortName = model.ShortName;
            entity.Address = model.Address;
            entity.ArchStyle = model.ArchStyle;
            entity.Latitude = model.Latitude;
            entity.Longitude = model.Longitude;
            entity.CountryId = model.CountryId;
            entity.CityId = model.CityId;
            entity.YearOfEstablishment = model.YearOfEstablishment;
        }
    }
} 