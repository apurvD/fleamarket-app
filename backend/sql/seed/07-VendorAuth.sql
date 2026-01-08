INSERT INTO vendor_auth (vendor_id, email, password)
SELECT 
    id AS vendor_id,
    email,
    '$2b$10$07UeewLkgDjVTkTJCTU1VONAUR/2XdPYZwBt/..PXaRC0UMjme8lu' AS password
FROM Vendor;