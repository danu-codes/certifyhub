
package com.certifyhub.backend.controller;

import com.certifyhub.backend.dto.CertificateSettings;
import com.certifyhub.backend.service.CertificateService;
import com.certifyhub.backend.service.ExcelService;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/certificates")
public class CertificateController {

    private final CertificateService certificateService;
    private final ExcelService excelService;
    private final ObjectMapper objectMapper;

    public CertificateController(
            CertificateService certificateService,
            ExcelService excelService,
            ObjectMapper objectMapper) {
        this.certificateService = certificateService;
        this.excelService = excelService;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(
                Map.of(
                        "status", "UP",
                        "application", "CertifyHub Backend"));
    }

    @PostMapping(value = "/preview", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<byte[]> preview(
            @RequestPart(value = "template", required = false) MultipartFile template,

            @RequestParam("name") String name,

            @RequestParam("settings") String settingsJson) throws IOException {

        CertificateSettings settings = objectMapper.readValue(
                settingsJson,
                CertificateSettings.class);

        byte[] pdf = certificateService.generateSingle(
                template,
                name,
                settings);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"certificate.pdf\"")
                .body(pdf);
    }

    @PostMapping(value = "/generate", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<byte[]> generate(
            @RequestPart(value = "template", required = false) MultipartFile template,

            @RequestPart("excel") MultipartFile excel,

            @RequestParam("settings") String settingsJson) throws IOException {

        CertificateSettings settings = objectMapper.readValue(
                settingsJson,
                CertificateSettings.class);

        List<String> names = excelService.readNames(excel);

        byte[] zip = certificateService.generateBulk(
                template,
                names,
                settings);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/zip"))
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"CertifyHub_Certificates.zip\"")
                .body(zip);
    }
}
