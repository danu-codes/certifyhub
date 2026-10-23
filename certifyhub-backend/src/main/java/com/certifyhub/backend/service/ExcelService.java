package com.certifyhub.backend.service;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ExcelService {

    private static final Set<String> NAME_HEADERS = Set.of(
        "name",
        "full name",
        "participant name",
        "student name",
        "recipient name",
        "certificate name"
    );

    public List<String> readNames(MultipartFile file)
            throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException(
                "Please upload an Excel file."
            );
        }

        String filename = file.getOriginalFilename() == null
            ? ""
            : file.getOriginalFilename().toLowerCase();

        if (!filename.endsWith(".xlsx")
                && !filename.endsWith(".xls")) {
            throw new IllegalArgumentException(
                "Only XLSX and XLS files are supported."
            );
        }

        List<String> names = new ArrayList<>();

        try (InputStream input = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(input)) {

            if (workbook.getNumberOfSheets() == 0) {
                throw new IllegalArgumentException(
                    "Excel file has no worksheets."
                );
            }

            Sheet sheet = workbook.getSheetAt(0);
            DataFormatter formatter = new DataFormatter();

            Row firstRow = sheet.getRow(sheet.getFirstRowNum());

            if (firstRow == null) {
                throw new IllegalArgumentException(
                    "Excel file is empty."
                );
            }

            int nameColumn = 0;
            boolean hasHeader = false;

            for (Cell cell : firstRow) {
                String value = formatter
                    .formatCellValue(cell)
                    .trim()
                    .toLowerCase();

                if (NAME_HEADERS.contains(value)) {
                    nameColumn = cell.getColumnIndex();
                    hasHeader = true;
                    break;
                }
            }

            int startRow = sheet.getFirstRowNum()
                + (hasHeader ? 1 : 0);

            for (int i = startRow; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);

                if (row == null) {
                    continue;
                }

                Cell cell = row.getCell(nameColumn);

                if (cell == null) {
                    continue;
                }

                String name = formatter
                    .formatCellValue(cell)
                    .trim();

                if (!name.isBlank()) {
                    names.add(name);
                }
            }
        } catch (IllegalArgumentException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new IOException(
                "Unable to read Excel file.", ex
            );
        }

        if (names.isEmpty()) {
            throw new IllegalArgumentException(
                "No participant names were found."
            );
        }

        if (names.size() > 500) {
            throw new IllegalArgumentException(
                "Maximum 500 participants per batch."
            );
        }

        return names;
    }
}